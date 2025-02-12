import pandas as pd

# Load the cleaned CSV
csv_file_path = 'clean/cleaned_cats_only_years.csv'
data_cleaned = pd.read_csv(csv_file_path)


# Sum across all cantons total cats each year
data_cleaned['Total Cats'] = data_cleaned.sum(axis=1)


total_cats = 'clean/total_cats.csv'

# Save
data_cleaned.to_csv(total_cats, index=False)