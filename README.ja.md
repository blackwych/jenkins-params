Jenkins Job Parameter Summary
=============================

コピー＆ペーストして使用できる Jenkins ジョブのパラメータのまとめを生成するためのブラウザ拡張です。


使用方法
--------
* Jenkins のビルドページを開きます。<br>
  （ビルドページ・パラメータページ・リビルドページに対応しています。）
* ツールバーの "Show Parameter Summary" ボタンをクリックすると、ポップアップが表示されます。
* 表示中のページが対応しているものであれば、ポップアップにパラメータのまとめが表示されます。<br>
  そうでなければ '(failure)' と表示されます。
* タブを切り替えて、お好みの表示形式を選択することができます。<br>
  現在は以下の形式をサポートしています：
  * Slack
  * BuildParam（Jenkins Build Param Plugin を使用したビルド URL）
* 表示されているまとめは、"Copy" ボタンをクリックするか直接選択してコピーすることができます。
