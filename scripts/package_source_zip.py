import os
import zipfile

def package_source_code():
    project_root = r"d:\0.University\01.FA26\SEG301\0.FinalProject"
    output_zip = os.path.join(
        project_root,
        "SEG301_FinalProject_Submission_SE201619_SE200932",
        "SourceCode_DiemMoi_SEG301.zip"
    )

    ignore_dirs = {
        'node_modules', '.git', '.venv', 'dist', '.turbo', '.next',
        '.vscode', '.idea', 'test-results', 'playwright-report',
        'SEG301_FinalProject_Submission_SE201619_SE200932',
        'SEG301_FinalProject_Submission_SE201619_SE200932_OLD',
        'temp_pptx_slides', '__pycache__'
    }

    ignore_extensions = {
        '.log', '.pyc', '.zip', '.pptx', '.pdf'
    }

    print(f"Creating clean zip package at: {output_zip} ...")
    file_count = 0

    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(project_root):
            # Modify dirs in-place to prune ignored directories
            dirs[:] = [d for d in dirs if d not in ignore_dirs and not d.startswith('.')]

            rel_dir = os.path.relpath(root, project_root)
            if any(part in ignore_dirs for part in rel_dir.split(os.sep)):
                continue

            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in ignore_extensions:
                    continue
                if file.startswith('.env') and file != '.env.example':
                    continue
                if file.startswith('~'):
                    continue

                full_path = os.path.join(root, file)
                archive_name = os.path.join("DiemMoi_SourceCode", os.path.relpath(full_path, project_root))
                zipf.write(full_path, archive_name)
                file_count += 1

    zip_size_kb = os.path.getsize(output_zip) / 1024
    print(f"Successfully packaged {file_count} files into {output_zip} ({zip_size_kb:.1f} KB)")

if __name__ == "__main__":
    package_source_code()

