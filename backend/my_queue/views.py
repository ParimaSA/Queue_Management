from datetime import datetime, timedelta
import random
from .models import Entry, Queue, Business

# Fetch the business and queue instances
business = Business.objects.get(name="TestEstimate")
queue = Queue.objects.get(business=business, name="A")

# Define the business hours
business_start_time = datetime.strptime("10:00", "%H:%M")
business_end_time = datetime.strptime("20:00", "%H:%M")

# Initialize the starting time for the first entry
current_time = business_start_time

# Generate 100 entries
n = 0
while n < 100:
    time_in_offset = random.randint(10, 20)
    time_in = current_time + timedelta(minutes=time_in_offset)
    if time_in > business_end_time:
        break  # Stop if the next entry exceeds business hours
    time_out_offset = random.randint(5, 20)
    time_out = time_in + timedelta(minutes=time_out_offset)
    Entry.objects.create(name=f"A{n}", queue=queue, business=business, time_in=time_in, time_out=time_out)
    current_time = time_out
    n += 1

print(f"{n} entries created.")
