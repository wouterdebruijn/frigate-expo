import React from "react";
import { StyleSheet, StyleProp, ViewStyle } from "react-native";
import WebView from "react-native-webview";
import type { WebViewErrorEvent } from "react-native-webview/lib/WebViewTypes";

interface MjpegWebViewProps {
  uri: string;
  style?: StyleProp<ViewStyle>;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (event: WebViewErrorEvent) => void;
}

export default function MjpegWebView({
  uri,
  style,
  onLoadStart,
  onLoadEnd,
  onError,
}: MjpegWebViewProps) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #000;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <img src="${uri}" />
      </body>
    </html>
  `;

  return (
    <WebView
      source={{ html: htmlContent }}
      style={style || styles.webview}
      scrollEnabled={true}
      bounces={false}
      onLoadStart={onLoadStart}
      onLoadEnd={onLoadEnd}
      onError={onError}
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
