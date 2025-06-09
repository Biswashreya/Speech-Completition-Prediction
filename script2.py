import os
import json


def update_titles(titles_file, json_dir):
    with open(titles_file, "r", encoding="utf-8") as f:
        titles = [line.strip() for line in f if line.strip()]

    print(f"Loaded {len(titles)} titles.")

    for i, title in enumerate(titles, start=119):
        json_path = os.path.join(json_dir, f"{i}.json")
        if not os.path.exists(json_path):
            print(f"File not found: {json_path}")
            continue

        with open(json_path, "r", encoding="utf-8") as jf:
            data = json.load(jf)

        data["title"] = title

        with open(json_path, "w", encoding="utf-8") as jf:
            json.dump(data, jf, indent=2, ensure_ascii=False)

        print(f"Updated {i}.json with title: {title}")

    print("\n title update complete!")


if __name__ == "__main__":
    update_titles("titles.txt", "formatted_transcripts")
