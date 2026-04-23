#!/usr/bin/env bash
set -e

CONFIG_NAME="caveman.json"

ask() {
  local prompt="$1"
  local default="$2"
  read -rp "$prompt [$default]: " val
  echo "${val:-$default}"
}

ask_yn() {
  local prompt="$1"
  local default="$2"
  local val
  val=$(ask "$prompt" "$default")
  [[ "$val" =~ ^[Nn][Oo]?$ ]] && echo "false" || echo "true"
}

echo "🦴 Caveman Plugin Setup"
echo ""

# Choose location
echo "Where to create config?"
echo "  1) Project root (./$CONFIG_NAME)"
echo "  2) Global (~/.config/opencode/$CONFIG_NAME)"
location=$(ask "Choose" "1")

if [ "$location" = "2" ]; then
  config_dir="$HOME/.config/opencode"
  mkdir -p "$config_dir"
  config_path="$config_dir/$CONFIG_NAME"
else
  config_path="./$CONFIG_NAME"
fi

if [ -f "$config_path" ]; then
  echo ""
  echo "⚠️  $config_path already exists."
  overwrite=$(ask_yn "Overwrite?" "no")
  if [ "$overwrite" != "true" ]; then
    echo "Aborted."
    exit 0
  fi
fi

echo ""
echo "Select features to enable:"
caveman=$(ask_yn "  Enable caveman communication mode?" "yes")
commit=$(ask_yn "  Enable /caveman-commit command?" "yes")
review=$(ask_yn "  Enable /caveman-review command?" "yes")

if [ "$caveman" = "true" ]; then
  echo ""
  echo "Choose default mode:"
  echo "  lite, full, ultra, wenyan-lite, wenyan-full, wenyan-ultra"
  default_mode=$(ask "Default mode" "full")
else
  default_mode="off"
fi

cat > "$config_path" <<EOF
{
  "enabled": true,
  "defaultMode": "$default_mode",
  "features": {
    "caveman": $caveman,
    "commit": $commit,
    "review": $review
  }
}
EOF

echo ""
echo "✅ Created $config_path"
