import { Graph } from '@antv/x6'
import { Selection } from '@antv/x6-plugin-selection'
import { JSDOM } from 'jsdom'
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="c" style="width:800px;height:600px"></div></body></html>')
global.window = dom.window
global.document = dom.window.document
const graph = new Graph({ container: document.getElementById('c'), width: 800, height: 600 })
graph.use(new Selection({ enabled: true }))
const plugin = graph.getPlugin('selection')
console.log('plugin:', typeof plugin)
console.log('enabled:', plugin?.options?.enabled)
