package com.leafora.nursery;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.core.content.FileProvider;
import androidx.core.view.WindowCompat;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

import java.io.File;

public class MainActivity extends Activity {
    private static final int FILE_CHOOSER_REQUEST = 4102;
    private ValueCallback<Uri[]> pendingFileCallback;
    private Uri cameraOutputUri;
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        getWindow().setStatusBarColor(android.graphics.Color.rgb(8, 27, 19));
        getWindow().setNavigationBarColor(android.graphics.Color.rgb(8, 27, 19));
        getWindow().getDecorView().setSystemUiVisibility(0);
        webView = new WebView(this);
        webView.setBackgroundColor(android.graphics.Color.rgb(8, 27, 19));
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setLoadsImagesAutomatically(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
        webView.setWebViewClient(new WebViewClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            @SuppressWarnings("deprecation")
            public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
                return assetLoader.shouldInterceptRequest(Uri.parse(url));
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (pendingFileCallback != null) pendingFileCallback.onReceiveValue(null);
                pendingFileCallback = callback;
                openPhotoPicker();
                return true;
            }
        });
        setContentView(webView);
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html");
    }

    private void openPhotoPicker() {
        Intent gallery = new Intent(Intent.ACTION_GET_CONTENT);
        gallery.setType("image/*");
        gallery.addCategory(Intent.CATEGORY_OPENABLE);
        Intent chooser = Intent.createChooser(gallery, "Choose a plant photo");
        try {
            File photo = new File(getExternalCacheDir(), "leafora_" + System.currentTimeMillis() + ".jpg");
            cameraOutputUri = FileProvider.getUriForFile(this, getPackageName() + ".files", photo);
            Intent camera = new Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
            camera.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, cameraOutputUri);
            camera.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{camera});
        } catch (Exception ignored) {
            cameraOutputUri = null;
        }
        startActivityForResult(chooser, FILE_CHOOSER_REQUEST);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != FILE_CHOOSER_REQUEST || pendingFileCallback == null) return;
        Uri chosen = data == null ? null : data.getData();
        if (chosen == null && resultCode == RESULT_OK) chosen = cameraOutputUri;
        pendingFileCallback.onReceiveValue(chosen == null ? null : new Uri[]{chosen});
        pendingFileCallback = null;
        cameraOutputUri = null;
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}
