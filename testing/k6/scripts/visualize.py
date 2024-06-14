# The RED Method

import os

import matplotlib.pyplot as plt
import pandas as pd

dirname = os.path.dirname(__file__)
results_filepath = os.path.abspath(os.path.join(dirname, "../results/results.csv"))
df = pd.read_csv(results_filepath, low_memory=False)

df["datetime"] = pd.to_datetime(df["timestamp"], unit="s")
start, end = df["datetime"].min(), df["datetime"].max()

frequency = 5  # seconds
bins = pd.date_range(start=start, end=end, freq=f"{frequency}s")
labels = [i * 5 for i in range(1, len(bins))]

df["second"] = pd.cut(df["datetime"], bins=bins.to_series(), labels=labels)

# not sure why there are NAs here, but it is so few it is fine for exploratory purposes
df = df[df["second"].notna()]

http_reqs = (
    df[df["metric_name"] == "http_reqs"]
    .groupby("second", as_index=False, observed=False)["metric_value"]
    .sum()
)

http_req_duration = (
    df[df["metric_name"] == "http_req_duration"]
    .groupby("second", as_index=False, observed=False)["metric_value"]
    .aggregate(["mean", "std", "min", "max"])
)

http_req_failed = (
    df[df["metric_name"] == "http_req_failed"]
    .groupby("second", as_index=False, observed=False)["metric_value"]
    .mean()
)

vus = df[df["metric_name"] == "vus"]

fig, axes = plt.subplots(4, 1, figsize=[10, 10], tight_layout=True)
(ax0, ax1, ax2, ax3) = axes

ax0.plot(vus["second"], vus["metric_value"])
ax0.set(xlabel="Time (Seconds)", ylabel="Virtual Users")

ax1.plot(http_reqs["second"], http_reqs["metric_value"])
ax1.set(xlabel="Time (Seconds)", ylabel="HTTP Requests")

ax2.plot(http_req_duration["second"], http_req_duration["mean"])
ax2.set(xlabel="Time (Seconds)", ylabel="HTTP Request Duration (ms)")

ax3.plot(http_req_failed["second"], http_req_failed["metric_value"])
ax3.set(xlabel="Time (Seconds)", ylabel="HTTP Request Failure Rate")

for ax in axes:
    ax.grid()

plt.show()
