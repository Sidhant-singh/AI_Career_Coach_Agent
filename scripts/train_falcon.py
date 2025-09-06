﻿import json
import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    TrainingArguments, 
    Trainer,
    DataCollatorForLanguageModeling
)
from datasets import Dataset
import os

# Load training data
print("ðŸ“š Loading training data...")
with open('data/falcon-interview-training.json', 'r') as f:
    training_data = json.load(f)

with open('data/falcon-interview-validation.json', 'r') as f:
    validation_data = json.load(f)

# Prepare data for training
def prepare_data(data):
    texts = []
    for item in data:
        prompt = item['prompt']
        completion = item['completion']
        texts.append(f"{prompt}\n{completion}")
    return texts

train_texts = prepare_data(training_data)
val_texts = prepare_data(validation_data)

# Load model and tokenizer
print("ðŸ¤– Loading Falcon model...")
model_name = "tiiuae/falcon-7b-instruct"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
    device_map="auto"
)

# Add padding token if it doesn't exist
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

# Tokenize data
def tokenize_function(examples):
    return tokenizer(
        examples["text"],
        truncation=True,
        padding=True,
        max_length=512
    )

# Create datasets
train_dataset = Dataset.from_dict({"text": train_texts})
val_dataset = Dataset.from_dict({"text": val_texts})

train_dataset = train_dataset.map(tokenize_function, batched=True)
val_dataset = val_dataset.map(tokenize_function, batched=True)

# Data collator
data_collator = DataCollatorForLanguageModeling(
    tokenizer=tokenizer,
    mlm=False
)

# Training arguments
training_args = TrainingArguments(
    output_dir="./falcon-interview-judge",
    num_train_epochs=3,
    per_device_train_batch_size=1,
    per_device_eval_batch_size=1,
    gradient_accumulation_steps=4,
    learning_rate=5e-5,
    warmup_steps=100,
    logging_steps=10,
    save_steps=500,
    eval_steps=500,
    evaluation_strategy="steps",
    save_strategy="steps",
    load_best_model_at_end=True,
    metric_for_best_model="eval_loss",
    greater_is_better=False,
    fp16=True,
    dataloader_num_workers=4,
    remove_unused_columns=False,
    push_to_hub=False,
    report_to=None
)

# Create trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    data_collator=data_collator,
)

# Start training
print("ðŸŽ¯ Starting training...")
trainer.train()

# Save the final model
print("ðŸ’¾ Saving model...")
trainer.save_model()
tokenizer.save_pretrained("./falcon-interview-judge")

print("âœ… Training completed successfully!")
print("ðŸ“ Model saved to: ./falcon-interview-judge")
