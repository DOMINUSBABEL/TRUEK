from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Set mobile viewport
    page.set_viewport_size({"width": 375, "height": 812})

    # Go to trades page directly bypassing auth via hash routing
    page.goto("http://localhost:4173/#/trades")
    page.wait_for_timeout(2000) # Wait for initial load

    # Simulate pressing Tab to test keyboard accessibility on the Search icon/input
    page.keyboard.press("Tab")
    page.wait_for_timeout(500)

    # Take screenshot at the key moment showing the UI
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            # We don't have an easy way to mock auth + data in the live app,
            # so we'll just visit the page. It will either redirect or show the empty state.
            # For the scope of our change (adding aria labels and loader state logic),
            # rendering the page and validating tab focus on the search input is a start.
            run_cuj(page)
        finally:
            context.close()
            browser.close()
