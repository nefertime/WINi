#!/bin/bash
# WINi — Claude Code launcher menu

MODELS=("claude-opus-4-6" "claude-sonnet-4-6" "claude-haiku-4-5-20251001")

echo ""
echo "  WINi — Claude Code"
echo "  ─────────────────────────────"
echo ""
echo "  1) Opus YOLO     claude --dangerously-skip-permissions --model claude-opus-4-6"
echo "  2) Select model   claude --dangerously-skip-permissions --model <pick>"
echo "  3) Normal         claude (default permissions)"
echo "  4) Shell only     just bash, no Claude"
echo ""
read -p "  Choose [1]: " choice
choice=${choice:-1}

case "$choice" in
  1)
    claude --dangerously-skip-permissions --model claude-opus-4-6
    ;;
  2)
    echo ""
    for i in "${!MODELS[@]}"; do
      echo "  $((i+1))) ${MODELS[$i]}"
    done
    echo ""
    read -p "  Model [1]: " mchoice
    mchoice=${mchoice:-1}
    model="${MODELS[$((mchoice-1))]}"
    if [[ -z "$model" ]]; then
      echo "  Invalid selection, using opus"
      model="claude-opus-4-6"
    fi
    echo "  Starting with $model..."
    claude --dangerously-skip-permissions --model "$model"
    ;;
  3)
    claude
    ;;
  4)
    echo "  Shell ready."
    ;;
  *)
    echo "  Invalid choice, starting Opus YOLO..."
    claude --dangerously-skip-permissions --model claude-opus-4-6
    ;;
esac
