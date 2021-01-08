import React, {Component} from 'react';

import {
  StyleSheet,
  Platform,
  Text,
  View,
  Alert,
  TouchableOpacity,
  Linking,
  NativeModules,
  DeviceEventEmitter,
  NativeEventEmitter,
} from 'react-native';

import {
  isFirstTime,
  isRolledBack,
  packageVersion,
  currentVersion,
  checkUpdate,
  downloadUpdate,
  switchVersion,
  switchVersionLater,
  markSuccess,
} from 'react-native-update';

import _updateConfig from '../update.json';

const {appKey} = _updateConfig[Platform.OS];

export default class Index extends Component {
  componentDidMount() {
    if (isFirstTime) {
      Alert.alert(
        '提示',
        '这是当前版本第一次启动,是否要模拟启动失败?失败将回滚到上一版本',
        [
          {
            text: '是',
            onPress: () => {
              throw new Error('模拟启动失败,请重启应用');
            },
          },
          {
            text: '否',
            onPress: () => {
              markSuccess();
            },
          },
        ],
      );
    } else if (isRolledBack) {
      Alert.alert('提示', '刚刚更新失败了,版本被回滚.');
    }
    const eventEmitter = new NativeEventEmitter(NativeModules.TransModule);
    this.eventEmitter = eventEmitter.addListener('NativeTime', res => {
      console.log('native time==>', res);
    });
  }

  componentWillUnmount() {
    this.eventEmitter.remove();
  }

  doUpdate = async info => {
    try {
      const hash = await downloadUpdate(info);
      Alert.alert('提示', '下载完毕,是否重启应用?', [
        {
          text: '是',
          onPress: () => {
            switchVersion(hash);
          },
        },
        {text: '否'},
        {
          text: '下次启动时',
          onPress: () => {
            switchVersionLater(hash);
          },
        },
      ]);
    } catch (err) {
      Alert.alert('更新失败', err.message);
    }
  };
  checkUpdate = async () => {
    if (__DEV__) {
      // 开发模式不支持热更新，跳过检查
      return;
    }
    let info;
    try {
      info = await checkUpdate(appKey);
    } catch (err) {
      Alert.alert('更新检查失败', err.message);
      return;
    }
    if (info.expired) {
      Alert.alert('提示', '您的应用版本已更新,请前往应用商店下载新的版本', [
        {
          text: '确定',
          onPress: () => {
            info.downloadUrl && Linking.openURL(info.downloadUrl);
          },
        },
      ]);
    } else if (info.upToDate) {
      Alert.alert('提示', '您的应用版本已是最新.');
    } else {
      Alert.alert(
        '提示',
        '检查到新的版本' + info.name + ',是否下载?\n' + info.description,
        [
          {
            text: '是',
            onPress: () => {
              this.doUpdate(info);
            },
          },
          {text: '否'},
        ],
      );
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>欢迎使用热更新服务_master</Text>
        <Text style={styles.instructions}>
          这是版本IOS {'\n'}
          当前原生包版本号: {packageVersion}
          {'\n'}
          当前热更新版本Hash: {currentVersion || '(空)'}
          {'\n'}
        </Text>
        <TouchableOpacity onPress={this.checkUpdate}>
          <Text style={styles.instructions}>点击这里检查更新</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            NativeModules.TransModule.getTime();
          }}>
          <Text>获取原生返回监听</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            NativeModules.TransModule.callBackTime(res => {
              console.log('返回结果', res);
            });
          }}>
          <Text>回调方式获取原生数据</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            let res = await NativeModules.TransModule.sendPromiseTime();
            console.log('返回结果', res);
          }}>
          <Text>promise方式获取原生数据</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
