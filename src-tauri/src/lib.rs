use serde::Serialize;
use std::{
    collections::BTreeMap,
    path::{Path, PathBuf},
};
use walkdir::WalkDir;

#[derive(Serialize)]
struct FolderImages {
    name: String,
    path: String,
    images: Vec<String>,
}

fn is_image(path: &Path) -> bool {
    matches!(
        path.extension()
            .and_then(|ext| ext.to_str())
            .map(|ext| ext.to_ascii_lowercase())
            .as_deref(),
        Some("jpg" | "jpeg" | "png" | "gif" | "bmp" | "webp" | "tiff" | "svg")
    )
}

#[tauri::command]
fn pick_folder() -> Option<String> {
    rfd::FileDialog::new()
        .set_title("选择图片文件夹")
        .pick_folder()
        .map(|path| path.to_string_lossy().to_string())
}

#[tauri::command]
fn load_images_from_dir(root: String) -> Result<Vec<FolderImages>, String> {
    let root_path = PathBuf::from(&root);
    if !root_path.exists() || !root_path.is_dir() {
        return Err("选择的路径不可用".into());
    }

    let root_name = root_path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("根目录")
        .to_string();

    let mut groups: BTreeMap<String, FolderImages> = BTreeMap::new();

    // Ensure root entry exists to show images placed directly under the chosen folder.
    groups.entry(root_name.clone()).or_insert(FolderImages {
        name: root_name.clone(),
        path: root_path.to_string_lossy().to_string(),
        images: Vec::new(),
    });

    for entry in WalkDir::new(&root_path)
        .into_iter()
        .filter_map(Result::ok)
        .filter(|e| e.file_type().is_file())
    {
        let path = entry.path();
        if !is_image(path) {
            continue;
        }

        let rel = path.strip_prefix(&root_path).ok();
        let top_folder = rel
            .and_then(|relative| relative.parent())
            .and_then(|parent| parent.components().next())
            .and_then(|component| component.as_os_str().to_str())
            .map(|name| name.to_string())
            .unwrap_or_else(|| root_name.clone());

        let folder_path = if top_folder == root_name {
            root_path.clone()
        } else {
            root_path.join(&top_folder)
        };

        let entry = groups.entry(top_folder.clone()).or_insert(FolderImages {
            name: top_folder,
            path: folder_path.to_string_lossy().to_string(),
            images: Vec::new(),
        });

        entry
            .images
            .push(path.to_string_lossy().to_string());
    }

    let mut result: Vec<FolderImages> = groups
        .into_values()
        .map(|mut folder| {
            folder.images.sort();
            folder
        })
        .collect();

    // Keep the root folder first for readability.
    let root_path_str = root_path.to_string_lossy().to_string();
    result.sort_by(|a, b| {
        if a.path == root_path_str {
            std::cmp::Ordering::Less
        } else if b.path == root_path_str {
            std::cmp::Ordering::Greater
        } else {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        }
    });

    Ok(result)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![pick_folder, load_images_from_dir])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
