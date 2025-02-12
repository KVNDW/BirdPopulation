import pandas as pd

data= pd.read_csv('data/raw/habitats.csv', sep=';')

data['mean'] = data['mean'].str.replace(',', '.').astype(float)

filtered_data = data[['mean', 'year', 'e']]

cleaned_csv_file_path = 'data/clean/habitats_data.csv'

filtered_data.to_csv(cleaned_csv_file_path, index=False)

print(f"Filtered data saved to {cleaned_csv_file_path}")