WSLの場合

1. windows側でmkcertをchoco等でインストールし、

```bash
$ mkcert -install

# 適当なドメイン名
$ mkcert abcdefghi.jp
```

とする。

メモ帳を管理者権限で立ち上げ、`C:/Windows/System32/drivers/etc/hosts`を開き、

```
::1 設定したドメイン
```

の行を追加する
