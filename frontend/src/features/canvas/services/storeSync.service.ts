import type { Node, Edge } from '@/lib/reactflow';
import type { TableNodeData, NoteNodeData, RelationshipEdgeData } from '../types/CanvasNode';
import { useTableStore } from '@/features/table/stores/table.store';
import { useColumnStore } from '@/features/column/stores/column.store';
import { useNoteStore } from '@/features/note/stores/note.store';
import { useRelationshipStore } from '@/features/relationship/stores/relationship.store';
import type { TableData } from '@/features/table/types/Table';
import type { ColumnData } from '@/features/column/types/Column';
import type { NoteData } from '@/features/note/types/Note';
import type { RelationshipData } from '@/features/relationship/types/Relationship';

export function syncNodesToFeatureStores(nodes: Node[], edges: Edge[]): void {
  const tableStore = useTableStore.getState();
  const columnStore = useColumnStore.getState();
  const noteStore = useNoteStore.getState();
  const relStore = useRelationshipStore.getState();

  for (const node of nodes) {
    if (node.type === 'table') {
      const data = node.data as unknown as TableNodeData;
      const tableData: TableData = {
        id: data.tableId,
        name: data.name,
        color: data.color,
        collapsed: data.collapsed,
        position: node.position,
        width: node.measured?.width ?? 240,
        reviewState: data.reviewState,
        columnIds: data.columns.map((c) => c.id),
      };

      const existingTable = tableStore.tables[data.tableId];
      if (existingTable) {
        tableStore.updateTable(data.tableId, {
          name: tableData.name,
          color: tableData.color,
          collapsed: tableData.collapsed,
          position: tableData.position,
          width: tableData.width,
          reviewState: tableData.reviewState,
          columnIds: tableData.columnIds,
        });
      } else {
        tableStore.addTable(tableData);
      }

      for (const col of data.columns) {
        const colData: ColumnData = {
          id: col.id,
          tableId: data.tableId,
          name: col.name,
          dataType: col.dataType,
          nullable: col.nullable,
          primaryKey: col.primaryKey,
          foreignKey: col.foreignKey,
          unique: col.unique,
          defaultValue: col.defaultValue,
          note: col.note,
          reviewState: col.reviewState,
          position: col.position,
        };

        const existingCol = columnStore.columns[col.id];
        if (existingCol) {
          columnStore.updateColumn(col.id, {
            tableId: colData.tableId,
            name: colData.name,
            dataType: colData.dataType,
            nullable: colData.nullable,
            primaryKey: colData.primaryKey,
            foreignKey: colData.foreignKey,
            unique: colData.unique,
            defaultValue: colData.defaultValue,
            note: colData.note,
            reviewState: colData.reviewState,
            position: colData.position,
          });
        } else {
          columnStore.addColumn(colData);
        }
      }
    }

    if (node.type === 'note') {
      const data = node.data as unknown as NoteNodeData;
      const noteData: NoteData = {
        id: data.noteId,
        content: data.content,
        reviewState: data.reviewState,
        position: node.position,
        width: data.width,
        height: data.height,
      };

      const existingNote = noteStore.notes[data.noteId];
      if (existingNote) {
        noteStore.updateNote(data.noteId, {
          content: noteData.content,
          reviewState: noteData.reviewState,
          position: noteData.position,
          width: noteData.width,
          height: noteData.height,
        });
      } else {
        noteStore.addNote(noteData);
      }
    }
  }

  for (const edge of edges) {
    if (edge.type === 'relationship') {
      const data = edge.data as unknown as RelationshipEdgeData;
      const relData: RelationshipData = {
        id: data.relationshipId,
        sourceTableId: edge.source,
        sourceColumnId: data.sourceColumnId,
        targetTableId: edge.target,
        targetColumnId: data.targetColumnId,
        relationshipType: data.relationshipType,
        reviewState: data.reviewState,
      };

      const existingRel = relStore.relationships[data.relationshipId];
      if (existingRel) {
        relStore.updateRelationship(data.relationshipId, {
          sourceTableId: relData.sourceTableId,
          sourceColumnId: relData.sourceColumnId,
          targetTableId: relData.targetTableId,
          targetColumnId: relData.targetColumnId,
          relationshipType: relData.relationshipType,
          reviewState: relData.reviewState,
        });
      } else {
        relStore.addRelationship(relData);
      }
    }
  }
}
