import pandas as pd
import argparse
import re


def time_to_seconds(t):
    """convert MM:SS or HH:MM:SS to secs"""
    parts = list(map(int, t.split(":")))
    if len(parts) == 2:
        return parts[0] * 60 + parts[1]
    elif len(parts) == 3:
        return parts[0] * 3600 + parts[1] * 60 + parts[2]
    else:
        return 0


def extract_start_end_sec(row):
    """parse row['start'] and row['end'] into secs"""
    start_sec = time_to_seconds(row["start"])
    end_sec = time_to_seconds(row["end"])
    return start_sec, end_sec


parser = argparse.ArgumentParser(description="add progress labels to CSV")
parser.add_argument(
    "--input", required=True, help="Path to input CSV (with start/end/text)"
)
parser.add_argument("--output", required=True, help="Path to output CSV")
parser.add_argument("--bins", type=int, default=0, help="Use bins (0 = no binning)")
args = parser.parse_args()

df = pd.read_csv(args.input)
df = df[df["text"].notnull() & df["text"].str.strip().astype(bool)]
print(f"Loaded {len(df)} rows")

df[["start_sec", "end_sec"]] = df.apply(
    lambda row: pd.Series(extract_start_end_sec(row)), axis=1
)

progress_values = []

for file_name, group in df.groupby("file"):
    total_duration = group["end_sec"].max()
    print(f"File {file_name}: total duration {total_duration:.1f} sec")

    for i, row in group.iterrows():
        center_time = (row["start_sec"] + row["end_sec"]) / 2
        progress = center_time / total_duration

        if args.bins > 0:
            bin_size = 1.0 / args.bins
            progress = round(progress / bin_size) * bin_size

        progress_values.append(progress)

df["progress"] = progress_values

df.to_csv(args.output, index=False)
print(f"OK: saved {len(df)} rows with progress to {args.output}")