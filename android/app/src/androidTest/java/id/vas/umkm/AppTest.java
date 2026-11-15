package id.vas.umkm;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.Assert.*;

@RunWith(AndroidJUnit4.class)
public class AppTest {
    @Rule public ActivityScenarioRule<MainActivity> activity = new ActivityScenarioRule<>(MainActivity.class);
    private String js(String script) throws Exception {
        CountDownLatch done = new CountDownLatch(1);
        AtomicReference<String> result = new AtomicReference<>();
        activity.getScenario().onActivity(a -> a.getWebView().evaluateJavascript(script, value -> { result.set(value); done.countDown(); }));
        assertTrue(done.await(10, TimeUnit.SECONDS));
        return result.get();
    }
    private void waitFor(String script) throws Exception {
        for (int i=0; i<60; i++) { if ("true".equals(js(script))) return; Thread.sleep(500); }
        fail("App condition timed out: " + script);
    }
    @Test public void offlineDemoAndPersistence() throws Exception {
        waitFor("!!document.querySelector('#authForm')");
        assertEquals("true",js("!!crypto.subtle && !!window.VASAndroid"));
        js("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Jelajahi data demo')).click()");
        waitFor("document.querySelector('#storeName')?.textContent === 'Toko Sembako Berkah'");
        js("location.hash='stok'");
        waitFor("document.querySelector('#crumb')?.textContent === 'Manajemen Stok'");
        assertEquals("true",js("document.querySelectorAll('tbody tr').length > 0"));
        js("localStorage.setItem('vas-android-test','saved'); location.reload()");
        waitFor("document.querySelector('#crumb')?.textContent === 'Manajemen Stok'");
        assertEquals("\"saved\"",js("localStorage.getItem('vas-android-test')"));
    }
}
