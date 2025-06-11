import os
import re
import json
import time
import random
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound


def format_time(seconds):
    m = int(seconds // 60)
    s = int(seconds % 60)
    return f"{m}:{s:02d}"


def get_video_id(url):
    match = re.search(r"(?:v=|youtu\.be/)([a-zA-Z0-9_-]{11})", url)
    if not match:
        raise ValueError(f"Invalid YouTube URL or video ID not found in '{url}'")
    return match.group(1)


def fetch_and_format_transcript(video_id):
    transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
    formatted = []
    for entry in transcript_list:
        start = format_time(entry["start"])
        end = format_time(entry["start"] + entry["duration"])
        text = entry["text"].replace("\n", " ").strip()
        formatted.append({"start": start, "end": end, "text": text})
    return {
        "title": "",
        "source": "NPTEL",
        "course": "Discrete Mathematics by Prof Sudarshan Iyengar",
        "transcript": formatted,
        "timestamped": True,
    }


def main(
    input_file="video_links.txt", output_dir="formatted_transcripts", start_index=1
):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    with open(input_file, "r") as f:
        urls = [line.strip() for line in f if line.strip()]

    # Preserve order using enumerate
    video_info = []
    for i, url in enumerate(urls):
        try:
            video_id = get_video_id(url)
            video_info.append((start_index + i, video_id, url))
        except ValueError as e:
            print(f"⚠️  Skipping invalid URL: {url} - {e}")

    pending = {video_id for _, video_id, _ in video_info}
    failed_permanent = set()

    attempt = 1
    while pending:
        print(f"\n--- Retry Attempt #{attempt}, Remaining: {len(pending)} ---")
        completed_this_round = set()

        for number, video_id, url in video_info:
            if video_id not in pending:
                continue

            print(f"\nFetching transcript for video ID: {video_id} (→ {number}.json)")
            try:
                transcript_json = fetch_and_format_transcript(video_id)
                output_path = os.path.join(output_dir, f"{number}.json")
                with open(output_path, "w", encoding="utf-8") as out_f:
                    json.dump(transcript_json, out_f, indent=2, ensure_ascii=False)
                print(f"✅ Saved transcript to {output_path}")
                completed_this_round.add(video_id)

            except (TranscriptsDisabled, NoTranscriptFound):
                print(
                    f"❌ No transcript for video ID {video_id}. Skipping permanently."
                )
                failed_permanent.add(video_id)
                completed_this_round.add(video_id)

            except Exception as e:
                print(f"⚠️  Temporary failure for video ID {video_id}: {e}")

            time.sleep(random.uniform(1.5, 3.5))

        pending -= completed_this_round
        attempt += 1

    print(
        f"\n🎉 All done! Transcripts saved: {len(video_info) - len(failed_permanent)}"
    )
    if failed_permanent:
        print("⚠️  The following video IDs had no transcripts available:")
        for _, video_id, url in video_info:
            if video_id in failed_permanent:
                print(f" - {video_id} ({url})")


if __name__ == "__main__":
    main()
