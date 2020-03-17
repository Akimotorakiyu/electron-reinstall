# electron-reinstall

## usage

### normal

**npm package 为 js 版本，故可以直接使用**

install

```sh
npm install -g  electron-reinstall
```

reinstall electron

```sh
cd [your project dir]
electron-reinstall
```

### npm link

**由于 ts-node 的 issue ，ts 版本暂时可能不能直接命令安装使用。可尝试克隆并 npm link**

[https://github.com/TypeStrong/ts-node/issues/935](https://github.com/TypeStrong/ts-node/issues/935)

```sh
git clone https://github.com/Akimotorakiyu/electron-reinstall.git

cd electron-reinstall

npm install

npm link
```

## LICENSE

MIT
