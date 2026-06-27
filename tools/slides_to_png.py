#!/usr/bin/env python3
"""슬라이드(PPTX/PDF) → 핸드북용 PNG 시퀀스 변환 (SLIDE 모듈).

사용법:
    PYTHONIOENCODING=utf-8 python slides_to_png.py <발표.pptx|발표.pdf> <핸드북폴더> [--dpi 150]

동작:
    1. PPTX면 LibreOffice headless로 PDF 변환
    2. PDF의 각 페이지를 PyMuPDF로 PNG 추출 → <핸드북폴더>/slides/01.png ...
    3. window.SLIDES 스캐폴드(섹션 칸 비움)를 stdout으로 출력 → index.html에 붙여 매핑 채우기
"""
import sys
import os
import shutil
import subprocess
import tempfile

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

SOFFICE_CANDIDATES = [
    r"C:\Program Files\LibreOffice\program\soffice.exe",
    r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
    "soffice",
]


def find_soffice():
    for c in SOFFICE_CANDIDATES:
        if os.path.isfile(c):
            return c
    w = shutil.which("soffice")
    return w if w else None


def pptx_to_pdf(pptx_path, out_dir):
    """LibreOffice headless로 PPTX → PDF. 변환된 PDF 경로 반환."""
    soffice = find_soffice()
    if not soffice:
        sys.exit("[실패] LibreOffice(soffice)를 찾지 못했습니다. 설치 경로를 확인하세요.")
    # 동시 실행 충돌 방지용 임시 프로필
    with tempfile.TemporaryDirectory() as profile:
        profile_uri = "file:///" + profile.replace("\\", "/")
        cmd = [
            soffice, "--headless", "--norestore",
            "-env:UserInstallation=" + profile_uri,
            "--convert-to", "pdf", "--outdir", out_dir, pptx_path,
        ]
        subprocess.run(cmd, check=True, timeout=300,
                       stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    base = os.path.splitext(os.path.basename(pptx_path))[0]
    pdf_path = os.path.join(out_dir, base + ".pdf")
    if not os.path.isfile(pdf_path):
        sys.exit("[실패] PDF 변환 결과를 찾지 못했습니다: " + pdf_path)
    return pdf_path


def pdf_to_pngs(pdf_path, slides_dir, dpi):
    """PyMuPDF로 PDF 각 페이지를 PNG로. 생성된 파일명 리스트 반환."""
    import fitz  # PyMuPDF

    doc = fitz.open(pdf_path)
    n = doc.page_count
    width = max(2, len(str(n)))
    mat = fitz.Matrix(dpi / 72, dpi / 72)
    names = []
    for i in range(n):
        pix = doc[i].get_pixmap(matrix=mat)
        name = str(i + 1).zfill(width) + ".png"
        pix.save(os.path.join(slides_dir, name))
        names.append(name)
    doc.close()
    return names


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dpi = 150
    if "--dpi" in sys.argv:
        dpi = int(sys.argv[sys.argv.index("--dpi") + 1])
    if len(args) < 2:
        sys.exit("사용법: python slides_to_png.py <발표.pptx|발표.pdf> <핸드북폴더> [--dpi 150]")

    src = os.path.abspath(args[0])
    book_dir = os.path.abspath(args[1])
    if not os.path.isfile(src):
        sys.exit("[실패] 입력 파일이 없습니다: " + src)

    slides_dir = os.path.join(book_dir, "slides")
    os.makedirs(slides_dir, exist_ok=True)

    ext = os.path.splitext(src)[1].lower()
    if ext in (".pptx", ".ppt"):
        with tempfile.TemporaryDirectory() as tmp:
            pdf_path = pptx_to_pdf(src, tmp)
            names = pdf_to_pngs(pdf_path, slides_dir, dpi)
    elif ext == ".pdf":
        names = pdf_to_pngs(src, slides_dir, dpi)
    else:
        sys.exit("[실패] 지원 형식: .pptx, .ppt, .pdf (입력: " + ext + ")")

    print("[완료] 슬라이드 %d장 → %s" % (len(names), slides_dir))
    print()
    print("// ▼ index.html의 window.SLIDES에 붙여넣고 section을 채우세요 (유연 매핑)")
    print("window.SLIDES = [")
    for nm in names:
        print('  { img: "slides/%s", section: null },' % nm)
    print("];")


if __name__ == "__main__":
    main()
