package id.vas.umkm;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.webkit.JavascriptInterface;
import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.webkit.WebViewAssetLoader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/assets/aplikasi.html";
    private WebView web;
    private String pendingData;
    public WebView getWebView() { return web; }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(0xff102d41);
        web = new WebView(this);
        web.setFitsSystemWindows(true);
        web.setOnApplyWindowInsetsListener((view, insets) -> {
            view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(), insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets.consumeSystemWindowInsets();
        });
        setContentView(web);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(false);
        web.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);
        web.addJavascriptInterface(new NativeActions(), "VASAndroid");
        WebViewAssetLoader assets = new WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                WebResourceResponse local = assets.shouldInterceptRequest(request.getUrl());
                if (local != null) return local;
                // The installed app runs entirely from packaged assets, including offline.
                return new WebResourceResponse("text/plain", "UTF-8", 404, "Not found", java.util.Collections.emptyMap(), new java.io.ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("https".equals(uri.getScheme()) && HOST.equals(uri.getHost()) && uri.getPath().startsWith("/assets/")) return false;
                if (request.isForMainFrame() && ("https".equals(uri.getScheme()) || "mailto".equals(uri.getScheme()))) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
                    catch (android.content.ActivityNotFoundException e) { Toast.makeText(MainActivity.this, "Tidak ada aplikasi untuk membuka tautan ini.", Toast.LENGTH_LONG).show(); }
                }
                return true;
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (url.startsWith("https://" + HOST + "/assets/")) view.evaluateJavascript("window.print = function(){ VASAndroid.printPage(); };", null);
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
                new AlertDialog.Builder(MainActivity.this).setTitle("VAS").setMessage(message)
                    .setPositiveButton("Lanjutkan", (d,w) -> result.confirm())
                    .setNegativeButton("Batal", (d,w) -> result.cancel())
                    .setOnCancelListener(d -> result.cancel()).show();
                return true;
            }
        });
        if (state == null || web.restoreState(state) == null) web.loadUrl(START);
    }
    public class NativeActions {
        @JavascriptInterface public void saveFile(String name, String data, String mime) {
            if (data.length() > 20_000_000) { runOnUiThread(() -> Toast.makeText(MainActivity.this, "Berkas terlalu besar.", Toast.LENGTH_LONG).show()); return; }
            if (!("application/json".equals(mime) || mime.startsWith("text/csv"))) return;
            runOnUiThread(() -> {
                if (pendingData != null) { Toast.makeText(MainActivity.this, "Selesaikan penyimpanan sebelumnya.", Toast.LENGTH_SHORT).show(); return; }
                pendingData = data;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE)
                    .setType(mime.startsWith("text/csv") ? "text/csv" : "application/json")
                    .putExtra(Intent.EXTRA_TITLE, name.replaceAll("[^a-zA-Z0-9._-]", "_"));
                try { startActivityForResult(intent, 101); }
                catch (android.content.ActivityNotFoundException e) { pendingData = null; Toast.makeText(MainActivity.this, "Penyimpanan berkas tidak tersedia.", Toast.LENGTH_LONG).show(); }
            });
        }
        @JavascriptInterface public void printPage() {
            runOnUiThread(() -> ((PrintManager)getSystemService(PRINT_SERVICE)).print("Laporan VAS", web.createPrintDocumentAdapter("VAS"), new PrintAttributes.Builder().build()));
        }
    }
    @Override protected void onActivityResult(int request, int result, Intent intent) {
        super.onActivityResult(request,result,intent);
        if (request != 101) return;
        String data = pendingData;
        pendingData = null;
        if (result != RESULT_OK || intent == null || intent.getData() == null || data == null) return;
        try (OutputStream out = getContentResolver().openOutputStream(intent.getData())) {
            if (out == null) throw new java.io.IOException("No output stream");
            out.write(data.getBytes(StandardCharsets.UTF_8));
            Toast.makeText(this,"Berkas berhasil disimpan.",Toast.LENGTH_SHORT).show();
        } catch (Exception e) { Toast.makeText(this,"Berkas gagal disimpan. Silakan coba lagi.",Toast.LENGTH_LONG).show(); }
    }
    @Override protected void onSaveInstanceState(Bundle out) { web.saveState(out); super.onSaveInstanceState(out); }
    @Override public void onBackPressed() {
        web.evaluateJavascript("(()=>{const d=document.querySelector('dialog[open]');if(d){d.close();return true;}return false;})()", result -> {
            if ("true".equals(result)) return;
            if (web.canGoBack()) web.goBack(); else new AlertDialog.Builder(this).setMessage("Tutup VAS?")
                .setPositiveButton("Tutup", (d,w) -> finish()).setNegativeButton("Batal",null).show();
        });
    }
}
