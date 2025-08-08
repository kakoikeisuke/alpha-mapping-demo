# Alpha Mapping Demo
デモページ  
[https://kakoikeisuke.github.io/alpha-mapping-demo/sample_room/](https://kakoikeisuke.github.io/alpha-mapping-demo/sample_room/)

## 概要
このリポジトリは, PNGファイルのアルファチャンネルを一意のIDとして利用し, 画像内のオブジェクトを識別するコードのデモです。  
3DCGのレンダーのAOVなどによって作成された画像を使用することを想定しています。

## 挙動
はじめにPNG画像のRGBAの情報を取得します。  
その後,アルファチャンネルを無視して（完全に不透明であるとして）canvasに描画します。  
マウスやタッチの位置を取得し, その場所にもともと指定されていたアルファチャンネルの値からオブジェクトの名前を照合しています。