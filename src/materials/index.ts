import type { MaterialLibrary } from '@uni-draw/shared'
import basic from './basic.json'
import edge from './edge.json'
import flowchart from './flowchart.json'
import uml from './uml.json'
import sequence from './sequence.json'
import er from './er.json'
import dfd from './dfd.json'
import swimlane from './swimlane.json'
import state from './state.json'

const libraries: MaterialLibrary[] = [basic, edge, flowchart, uml, sequence, er, dfd, swimlane, state]

/**
 * 获取所有素材库
 */
export function getAllLibraries(): MaterialLibrary[] {
  return libraries
}

/**
 * 根据 ID 获取素材库
 */
export function getLibraryById(id: string): MaterialLibrary | undefined {
  return libraries.find(lib => lib.id === id)
}

export { basic, edge, flowchart, uml, sequence, er, dfd, swimlane, state }
