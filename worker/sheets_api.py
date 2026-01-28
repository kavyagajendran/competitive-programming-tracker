import gspread
from oauth2client.service_account import ServiceAccountCredentials
import pandas as pd
import os
import datetime

SCOPE = [
    "https://spreadsheets.google.com/feeds",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive"
]

CREDENTIALS_FILE = "credentials.json"

def get_client():
    # Use absolute path relative to this script to ensure we find the file 
    # regardless of where the script is run from.
    base_dir = os.path.dirname(os.path.abspath(__file__))
    creds_path = os.path.join(base_dir, CREDENTIALS_FILE)
    
    if not os.path.exists(creds_path):
        print(f"Error: Credentials file not found at {creds_path}")
        return None
        
    creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, SCOPE)
    client = gspread.authorize(creds)
    return client

def get_sheet_instance(client, sheet_identifier):
    """
    Helper to open sheet by URL, Key, or Title.
    """
    try:
        if sheet_identifier.startswith('https://'):
            return client.open_by_url(sheet_identifier).sheet1
        else:
            return client.open(sheet_identifier).sheet1
    except Exception as e:
        print(f"Error opening sheet '{sheet_identifier}': {e}")
        return None

def read_sheet(sheet_identifier):
    client = get_client()
    if not client:
        return None, "Credentials file not found."
    
    try:
        sheet = get_sheet_instance(client, sheet_identifier)
        if not sheet:
            return None, "Sheet not found or inaccessible."
            
        data = sheet.get_all_records()
        return data, None
    except Exception as e:
        return None, str(e)

def update_sheet(sheet_identifier, data_list):
    """
    data_list: list of dicts with keys matching headers. 
    Assumes first row is headers.
    """
    client = get_client()
    if not client:
        return "Credentials file not found."

    try:
        sheet = get_sheet_instance(client, sheet_identifier)
        if not sheet:
            return "Sheet not found or inaccessible."

        # Convert to DataFrame to easily handle updates or just overwrite everything
        # For simplicity in this v1, we will re-write the whole sheet or specific cells.
        # But 'update existing rows by overwriting old' suggests we match IDs.
        
        # Strategy: Read existing, update rows, write back.
        existing_data = sheet.get_all_records()
        df = pd.DataFrame(existing_data)
        
        # If empty, just write
        if df.empty:
            df = pd.DataFrame(data_list)
        else:
            # Upsert logic based on 'Profile Link' (assuming it exists)
            # We must ensure the new data has 'Profile Link' as well.
            # In the CSV flow, we always have 'Profile Link'.
            
            # Create a map of Link -> Index in existing DF
            # This is complex if columns mismatch. 
            # Simplified approach: Append new rows if not exist, Update if exist.
            
            # Let's rebuild the DF from the input data_list for the relevant rows, 
            # effectively "Updating" them.
            
            for new_row in data_list:
                link = new_row.get('Profile Link')
                if not link: continue
                
                # Check if exists
                if 'Profile Link' in df.columns:
                    mask = df['Profile Link'] == link
                    if mask.any():
                        # Update existing
                        for k, v in new_row.items():
                            df.loc[mask, k] = v
                    else:
                        # Append
                         df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
                else:
                    # If sheet has no 'Profile Link' column, we might be determining structure newly?
                    # or it's a fresh sheet.
                    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)

        # Write back
        # Manual:
        df = df.fillna('')
        headers = df.columns.tolist()
        values = [headers] + df.values.tolist()
        sheet.clear()
        sheet.update(values)
        return "Success"
        
    except Exception as e:
        return str(e)
