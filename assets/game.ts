import { _decorator, Component, Node, Prefab, UITransform, instantiate, Event, EventTouch, input, Input, Vec3 } from 'cc';
import { Cell } from './cell';
const { ccclass, property } = _decorator;

@ccclass('game')
export class game extends Component {
    @property(Prefab)
    cellPrefab: Prefab = null
    @property
    cellSize: number = 20 //单个细胞的像素宽度
    @property
    columnCnt: number = 30
    @property
    rowCnt: number = 30

    cellNodes: Node[][] = []
    isPause: boolean = true
    private tt: number = 0
    stateMap: boolean[][] = []


    onLoad() {
        // 读取cell prefab的宽度
        this.cellPrefab.data.getComponent(UITransform).setContentSize(this.cellSize, this.cellSize)
        // 根据行列数量，然后自适应修改宽高
        const transform = this.node.getComponent(UITransform)
        transform.height = this.rowCnt * this.cellSize
        transform.width = this.columnCnt * this.cellSize

        const startTime = Date.now()
        // 生成所有细胞
        for (let row = 0; row < this.rowCnt; row++) {
            // 二维数组中第一维的每个元素都要初始化，不然[1][0]起会报错
            this.cellNodes[row] = new Array<Node>()
            for (let col = 0; col < this.columnCnt; col++) {
                const cellNode = instantiate(this.cellPrefab)
                // console.log(this.cells)
                cellNode.setPosition(col * this.cellSize, row * this.cellSize)
                cellNode.setParent(this.node)
                // 二维数组中第二行赋值不能直接赋，参考https://wenku.baidu.com/view/fa07293b5aeef8c75fbfc77da26925c52cc591da.html
                this.cellNodes[row][col] = cellNode
            }
        }

        // 计算生成细胞的耗时
        const endTime = Date.now()
        console.log('spend time: ', endTime - startTime, ' ms')

        // touch event
        // this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this)
    }

    start() {

    }

    update(deltaTime: number) {
        // 暂停时不执行
        if (this.isPause) return
        this.tt += deltaTime
        if (this.tt > 0.1) {
            this.tt = 0
            this.lifeChange()
        }
    }

    lifeChange() {
        // 遍历cellNodes，把所有cell的状态存下来
        for (let row = 0; row < this.cellNodes.length; row++) {
            // 初始化mapState二维数组
            this.stateMap[row] = []
            for (let col = 0; col < this.cellNodes[row].length; col++) {
                const cellNode = this.cellNodes[row][col]
                this.stateMap[row][col] = this.cellNodes[row][col].getComponent(Cell).isAlive
            }
        }
        // console.log('before life change',this.stateMap)
        for (let row = 0; row < this.stateMap.length; row++) {
            for (let col = 0; col < this.stateMap[row].length; col++) {
                const cell = this.cellNodes[row][col].getComponent(Cell)
                const lifeCount = this.countNearCells(row, col)
                // console.log(`cell(${row},${col}) is ${this.stateMap[row][col]}, ${lifeCount} life nearby`)
                /*
                规则1：生命害怕孤独，如果一个生命周围的生命少于2个，它就在回合结束时死亡
                规则2：生命讨厌拥挤，如果一个生命周围的生命超过3个，它也在回合结束时死亡
                规则3：生命会繁殖，如果一个死个字周围有3个生命，它就在回合结束时获得生命
                 */
                if (cell.isAlive) {
                    // 规则1、2
                    if (lifeCount < 2 || lifeCount > 3) {
                        cell.isAlive = false
                    }
                } else {
                    // 规则3
                    if (lifeCount == 3) {
                        cell.isAlive = true
                    }
                }
            }
        }
        // console.log('after life change', this.stateMap)

    }

    /**
         * 计算目标细胞周围8个格子中存活的细胞数量 
         * 输入：目标细胞的位置，row，col
         * 输出：目标细胞周围8格存活细胞数量
         * */
    countNearCells(row: number, col: number): number {
        let count = 0
        // TODO: implement this
        // 周围八个各自相较于中心各自行列的偏移量
        const offsets = [
            [1, -1], [1, 0], [1, 1],
            [0, -1], [0, 1],
            [-1, -1], [-1, 0], [-1, 1]
        ]
        // 遍历周围8个格子
        for (const offset of offsets) {
            const nearCellRow = row + offset[0]
            const nearCellCol = col + offset[1]
            // 如果周围格子超出边界就跳过
            if (nearCellRow < 0 || nearCellRow >= this.rowCnt || nearCellCol < 0 || nearCellCol >= this.columnCnt) continue
            // 如果这个周边格子存活，计数+1
            if (this.stateMap[nearCellRow][nearCellCol]) count++
        }
        return count
    }
}

