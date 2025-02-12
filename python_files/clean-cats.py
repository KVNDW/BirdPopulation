import pandas as pd

# path to csv
csv_file_path = 'raw/cats.csv'

# Read the CSV file
data_cleaned = pd.read_csv(csv_file_path, sep=';', skiprows=1)

# path to store new file (was in a venv python repo not this one)
cleaned_csv_file_path = 'clean/cleaned_cats.csv'

# Save the cleaned data
data_cleaned.to_csv(cleaned_csv_file_path, index=False)

print(f"Cleaned CSV saved to {cleaned_csv_file_path}")