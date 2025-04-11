# Node.js の公式イメージ（LTS版）を使用
FROM node:18

# 作業ディレクトリを作成
WORKDIR /app

# 依存関係のインストール用に package.json をコピー
COPY package.json ./

# 依存パッケージをインストール
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# コンテナ起動時に実行するコマンド
CMD ["npm", "start"]
