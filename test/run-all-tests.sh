#!/bin/bash
# ============================================
# Focudrant 测试入口脚本
# ============================================
# 
# 用法: ./test/run-all-tests.sh [options]
# 
# 选项:
#   --functional  只运行功能测试
#   --smoke       只运行冒烟测试
#   --all         运行所有测试（默认）
# ============================================

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 默认运行所有测试
RUN_FUNCTIONAL=true
RUN_SMOKE=true

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --functional)
            RUN_FUNCTIONAL=true
            RUN_SMOKE=false
            shift
            ;;
        --smoke)
            RUN_FUNCTIONAL=false
            RUN_SMOKE=true
            shift
            ;;
        --all)
            RUN_FUNCTIONAL=true
            RUN_SMOKE=true
            shift
            ;;
        *)
            echo "未知选项: $1"
            exit 1
            ;;
    esac
done

echo ""
echo "============================================="
echo "  Focudrant 测试套件"
echo "============================================="
echo ""

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 切换到项目目录
cd "$PROJECT_DIR"

# 运行功能测试
if [ "$RUN_FUNCTIONAL" = true ]; then
    echo -e "${BLUE}【1】运行功能测试...${NC}"
    echo ""
    
    if [ -f "$SCRIPT_DIR/functional-test.sh" ]; then
        chmod +x "$SCRIPT_DIR/functional-test.sh"
        bash "$SCRIPT_DIR/functional-test.sh"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}功能测试通过${NC}"
            ((PASSED_TESTS++))
        else
            echo -e "${RED}功能测试失败${NC}"
            ((FAILED_TESTS++))
        fi
        ((TOTAL_TESTS++))
    else
        echo -e "${YELLOW}功能测试脚本不存在${NC}"
    fi
    
    echo ""
fi

# 运行冒烟测试
if [ "$RUN_SMOKE" = true ]; then
    echo -e "${BLUE}【2】运行冒烟测试...${NC}"
    echo ""
    
    if [ -f "$SCRIPT_DIR/smoke-test.js" ]; then
        node "$SCRIPT_DIR/smoke-test.js"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}冒烟测试通过${NC}"
            ((PASSED_TESTS++))
        else
            echo -e "${RED}冒烟测试失败${NC}"
            ((FAILED_TESTS++))
        fi
        ((TOTAL_TESTS++))
    else
        echo -e "${YELLOW}冒烟测试脚本不存在${NC}"
    fi
    
    echo ""
fi

# 汇总结果
echo "============================================="
echo "              测试汇总"
echo "============================================="
echo ""
echo -e "  总测试数: $TOTAL_TESTS"
echo -e "  ${GREEN}通过: $PASSED_TESTS${NC}"
echo -e "  ${RED}失败: $FAILED_TESTS${NC}"
echo ""
echo "============================================="

# 返回退出码
if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${RED}部分测试失败${NC}"
    exit 1
else
    echo -e "${GREEN}所有测试通过！${NC}"
    exit 0
fi
