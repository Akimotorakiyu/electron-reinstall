# electron-reinstall

## ts-node issue

## usage

### test pass

status:[https://github.com/TypeStrong/ts-node/issues/935](https://github.com/TypeStrong/ts-node/issues/935)

由于 ts-node 的 issue ，暂时可能不能直接命令安装使用。

```sh
git clone https://github.com/Akimotorakiyu/electron-reinstall.git

cd electron-reinstall

npm install

npm link
```

### normal : but with ts-node issue

**由于 ts-node 的 issue ，暂时可能不能直接命令安装使用。建议使用上面的方法**

install

```sh
npm install -g  electron-reinstall
```

reinstall electron

```sh
cd [your project dir]
electron-reinstall
```

## LICENSE

MIT
