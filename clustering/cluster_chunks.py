import json
import numpy as np
from sklearn.decomposition import PCA
import hdbscan
import os
from collections import Counter
from tqdm import tqdm
import time
import umap

with open("../", "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"Loaded {len(data)} chunk embeddings")

print("Converting embeddings to np array")
embeddings = np.array([d["embedding"] for d in tqdm(data)])

print("Reducing dimensionality with PCA (retain 95% variance):")
pca = PCA(n_components=0.95, svd_solver="full", random_state=42)
start = time.time()
pca_embeddings = pca.fit_transform(embeddings)
end = time.time()
explained_variance = np.sum(pca.explained_variance_ratio_)
print(f"Total variance retained by PCA: {explained_variance:.4f}")
print(f"PCA reduced dimensions from {embeddings.shape[1]} to {pca_embeddings.shape[1]} in {end - start:.2f} seconds")


print("Reducing dimensionality with UMAP to 20 dimensions:")
reducer = umap.UMAP(n_components=20, metric='euclidean', random_state=42, verbose=True)
start = time.time()
umap_embeddings = reducer.fit_transform(pca_embeddings)
end = time.time()
print(f"UMAP reduced dimensions from {pca_embeddings.shape[1]} to {umap_embeddings.shape[1]} in {end - start:.2f} seconds")

print("Clustering with hdbscan:")
clusterer = hdbscan.HDBSCAN(
    min_cluster_size=5, 
    min_samples=5,
    metric='euclidean',
    cluster_selection_method='eom',
    prediction_data=True
)
start = time.time()
cluster_labels = clusterer.fit_predict(umap_embeddings)
end = time.time()
print(f"HDBSCAN clustering done in {end - start:.2f} seconds")

for d, label in zip(data, cluster_labels):
    d["cluster"] = int(label)

print(Counter(cluster_labels))

output_path = ""
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print(f"Saved clustered chunks to {output_path}")
num_clusters = len(set(cluster_labels)) - (1 if -1 in cluster_labels else 0)
noise_points = np.sum(cluster_labels == -1)
print(f"Identified {num_clusters} clusters with {noise_points} noise points")