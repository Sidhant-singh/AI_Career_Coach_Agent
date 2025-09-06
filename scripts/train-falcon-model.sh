#!/bin/bash
# Falcon Fine-tuning Script
# Make sure you have the Hugging Face transformers library installed

python -m transformers.trainer \
  --model_name_or_path tiiuae/falcon-7b-instruct \
  --train_file ../data/falcon-interview-training.json \
  --validation_file ../data/falcon-interview-validation.json \
  --output_dir ./falcon-interview-judge \
  --num_train_epochs 3 \
  --per_device_train_batch_size 1 \
  --per_device_eval_batch_size 1 \
  --gradient_accumulation_steps 4 \
  --learning_rate 5e-5 \
  --warmup_steps 100 \
  --logging_steps 10 \
  --save_steps 500 \
  --eval_steps 500 \
  --evaluation_strategy steps \
  --save_strategy steps \
  --load_best_model_at_end true \
  --metric_for_best_model eval_loss \
  --greater_is_better false \
  --fp16 \
  --dataloader_num_workers 4 \
  --remove_unused_columns false \
  --push_to_hub false
