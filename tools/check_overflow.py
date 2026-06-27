#!/usr/bin/env python
"""핸드북 빌드 결과(index.html) 오버플로우·레이아웃 사전 점검.

사용:
    python check_overflow.py <폴더>/index.html

검사:
    1. 정적(BeautifulSoup): 항상 실행. 의존성 ≤ bs4
       - <pre><code> 한 줄 길이 > 100자 (모바일 가로 스크롤 위험)
       - <table> 컬럼 > 5 (모바일 좁아짐 위험)
       - <h1>/<h2>/<h3> 텍스트 > 40자 (표지/제목 밖으로 나갈 위험)
       - inline style="width: 고정px"이 모바일 폭(375px) 초과
       - 사이드바 TOC 링크 ↔ 본문 anchor 매칭

    2. 동적(Playwright): playwright 설치돼 있으면 실행
       - 375 / 768 / 1280 viewport에서 실제 렌더 후 scrollWidth>clientWidth 박스 색출
"""
from __future__ import annotations
import json
import re
import sys
from pathlib import Path

try:
    from bs4 import BeautifulSoup
except ImportError:
    print("[ERROR] beautifulsoup4 필요: pip install beautifulsoup4", file=sys.stderr)
    sys.exit(1)


MOBILE_W = 375
LONG_LINE = 100
LONG_HEADING = 40
WIDE_TABLE = 5


def check_static(html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    issues = []

    # 1. 코드 블록 긴 줄
    for pre in soup.select("pre code"):
        for i, line in enumerate(pre.get_text().split("\n"), 1):
            if len(line) > LONG_LINE:
                issues.append({
                    "kind": "long_code_line",
                    "where": f"<pre><code> line {i}",
                    "detail": f"{len(line)}자 (제한 {LONG_LINE})",
                    "preview": line[:60] + "...",
                })
                break  # 블록당 한 번만

    # 2. 넓은 테이블
    for tbl in soup.find_all("table"):
        first_row = tbl.find("tr")
        if not first_row:
            continue
        cols = len(first_row.find_all(["th", "td"]))
        if cols > WIDE_TABLE:
            issues.append({
                "kind": "wide_table",
                "where": (tbl.get("class") or ["table"])[0],
                "detail": f"{cols}컬럼 (모바일 권장 ≤ {WIDE_TABLE})",
            })

    # 3. 긴 제목
    for tag in soup.find_all(["h1", "h2", "h3"]):
        text = tag.get_text(strip=True)
        if len(text) > LONG_HEADING:
            issues.append({
                "kind": "long_heading",
                "where": tag.name,
                "detail": f"{len(text)}자 (권장 ≤ {LONG_HEADING})",
                "preview": text[:60] + ("..." if len(text) > 60 else ""),
            })

    # 4. 고정 width inline style이 모바일 초과
    for el in soup.find_all(style=re.compile(r"width\s*:\s*\d+px")):
        m = re.search(r"width\s*:\s*(\d+)px", el.get("style", ""))
        if m and int(m.group(1)) > MOBILE_W:
            issues.append({
                "kind": "fixed_width_overflow",
                "where": f"<{el.name}>",
                "detail": f"width: {m.group(1)}px > 모바일 폭 {MOBILE_W}px",
            })

    # 5. TOC 앵커 매칭
    toc_links = [a.get("href", "") for a in soup.select("aside.toc a[href^='#']")]
    body_ids = {el.get("id") for el in soup.find_all(id=True)}
    body_ids.discard(None)
    for href in toc_links:
        anchor = href.lstrip("#")
        if anchor and anchor not in body_ids:
            issues.append({
                "kind": "broken_toc_anchor",
                "where": f"aside.toc a[href='{href}']",
                "detail": "본문에 해당 id가 없음",
            })

    return {"mode": "static", "issues": issues}


def check_dynamic(html_path: Path) -> dict:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return {"mode": "dynamic", "skipped": "playwright 미설치 (pip install playwright; playwright install chromium)"}

    issues = []
    viewports = [("mobile", 375, 667), ("tablet", 768, 1024), ("desktop", 1280, 800)]
    url = html_path.resolve().as_uri()

    with sync_playwright() as p:
        browser = p.chromium.launch()
        for name, w, h in viewports:
            page = browser.new_page(viewport={"width": w, "height": h})
            page.goto(url, wait_until="domcontentloaded")
            overflowing = page.evaluate("""
                () => {
                    const out = [];
                    document.querySelectorAll('body *').forEach(el => {
                        const cs = getComputedStyle(el);
                        if (cs.overflow === 'visible' || cs.overflowX === 'visible') {
                            const dx = el.scrollWidth - el.clientWidth;
                            if (dx > 1 && el.clientWidth > 0) {
                                out.push({
                                    tag: el.tagName.toLowerCase(),
                                    cls: el.className || '',
                                    id: el.id || '',
                                    overflow_px: dx,
                                });
                            }
                        }
                    });
                    return out.slice(0, 20);
                }
            """)
            for ov in overflowing:
                issues.append({
                    "kind": "horizontal_overflow",
                    "viewport": name,
                    "where": f"<{ov['tag']}>" + (f".{ov['cls']}" if ov['cls'] else "") + (f"#{ov['id']}" if ov['id'] else ""),
                    "detail": f"{ov['overflow_px']}px 초과 ({name} {w}x{h})",
                })
            page.close()
        browser.close()
    return {"mode": "dynamic", "issues": issues}


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    target = Path(sys.argv[1])
    if not target.exists():
        print(f"[ERROR] 파일 없음: {target}", file=sys.stderr)
        sys.exit(1)

    html = target.read_text(encoding="utf-8")
    static = check_static(html)
    dynamic = check_dynamic(target)

    print(f"\n=== 핸드북 오버플로우 점검: {target} ===\n")
    for report in (static, dynamic):
        print(f"[{report['mode']}]")
        if "skipped" in report:
            print(f"  스킵: {report['skipped']}\n")
            continue
        if not report["issues"]:
            print("  ✓ 이슈 없음\n")
            continue
        for issue in report["issues"]:
            line = f"  ⚠ {issue['kind']:<24} {issue.get('where', ''):<30} {issue.get('detail', '')}"
            if "viewport" in issue:
                line += f"  [{issue['viewport']}]"
            print(line)
            if "preview" in issue:
                print(f"      → {issue['preview']}")
        print()

    total = len(static["issues"]) + len(dynamic.get("issues", []))
    print(f"총 {total}개 이슈")
    sys.exit(1 if total else 0)


if __name__ == "__main__":
    main()
