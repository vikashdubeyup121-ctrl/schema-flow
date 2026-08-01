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

export function syncNodesToFeatureStores(
  nodes: Node[],
  edges: Edge[],
  mode: 'full' | 'geometry' = 'full'
): void {
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
        if (mode === 'geometry') {
          const hasChanges =
            existingTable.position?.x !== tableData.position?.x ||
            existingTable.position?.y !== tableData.position?.y ||
            existingTable.width !== tableData.width;
            
          if (hasChanges) {
            tableStore.updateTable(data.tableId, {
              position: tableData.position,
              width: tableData.width,
            });
          }
        } else {
          const update = {
            name: tableData.name,
            color: tableData.color,
            collapsed: tableData.collapsed,
            position: tableData.position,
            width: tableData.width,
            reviewState: tableData.reviewState,
            columnIds: tableData.columnIds,
          };
          const hasChanges =
            existingTable.name !== update.name ||
            existingTable.color !== update.color ||
            existingTable.collapsed !== update.collapsed ||
            existingTable.position?.x !== update.position?.x ||
            existingTable.position?.y !== update.position?.y ||
            existingTable.width !== update.width ||
            existingTable.reviewState !== update.reviewState ||
            existingTable.columnIds.length !== update.columnIds.length ||
            existingTable.columnIds.some((id, i) => id !== update.columnIds[i]);
            
          if (hasChanges) {
            tableStore.updateTable(data.tableId, update);
          }
        }
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
          if (mode === 'full') {
            const hasChanges = 
              existingCol.name !== colData.name ||
              existingCol.dataType !== colData.dataType ||
              existingCol.nullable !== colData.nullable ||
              existingCol.primaryKey !== colData.primaryKey ||
              existingCol.foreignKey !== colData.foreignKey ||
              existingCol.unique !== colData.unique ||
              existingCol.defaultValue !== colData.defaultValue ||
              existingCol.note !== colData.note ||
              existingCol.reviewState !== colData.reviewState ||
              existingCol.position !== colData.position;

            if (hasChanges) {
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
            }
          }
        } else {
          columnStore.addColumn(colData);
        }
      }
    }

    if (node.type === 'note') {
      const data = node.data as unknown as NoteNodeData;
      const noteData: NoteData = {
        id: data.noteId,
        title: data.title,
        color: data.color,
        content: data.content,
        reviewState: data.reviewState,
        position: node.position,
        width: data.width,
        height: data.height,
      };

      const existingNote = noteStore.notes[data.noteId];
      if (existingNote) {
        if (mode === 'geometry') {
          const hasChanges = 
            existingNote.position?.x !== noteData.position?.x ||
            existingNote.position?.y !== noteData.position?.y ||
            existingNote.width !== noteData.width ||
            existingNote.height !== noteData.height;

          if (hasChanges) {
            noteStore.updateNote(data.noteId, {
              position: noteData.position,
              width: noteData.width,
              height: noteData.height,
            });
          }
        } else {
          const hasChanges = 
            existingNote.title !== noteData.title ||
            existingNote.color !== noteData.color ||
            existingNote.content !== noteData.content ||
            existingNote.reviewState !== noteData.reviewState ||
            existingNote.position?.x !== noteData.position?.x ||
            existingNote.position?.y !== noteData.position?.y ||
            existingNote.width !== noteData.width ||
            existingNote.height !== noteData.height;

          if (hasChanges) {
            noteStore.updateNote(data.noteId, {
              title: noteData.title,
              color: noteData.color,
              content: noteData.content,
              reviewState: noteData.reviewState,
              position: noteData.position,
              width: noteData.width,
              height: noteData.height,
            });
          }
        }
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
        if (mode === 'full') {
          const hasChanges = 
            existingRel.sourceTableId !== relData.sourceTableId ||
            existingRel.sourceColumnId !== relData.sourceColumnId ||
            existingRel.targetTableId !== relData.targetTableId ||
            existingRel.targetColumnId !== relData.targetColumnId ||
            existingRel.relationshipType !== relData.relationshipType ||
            existingRel.reviewState !== relData.reviewState;

          if (hasChanges) {
            relStore.updateRelationship(data.relationshipId, {
              sourceTableId: relData.sourceTableId,
              sourceColumnId: relData.sourceColumnId,
              targetTableId: relData.targetTableId,
              targetColumnId: relData.targetColumnId,
              relationshipType: relData.relationshipType,
              reviewState: relData.reviewState,
            });
          }
        }
      } else {
        relStore.addRelationship(relData);
      }
    }
  }

  if (mode === 'full') {
    // Cleanup: Remove items from stores that no longer exist in the AST/nodes
    const tableIds = new Set(
      nodes.filter(n => n.type === 'table').map(n => (n.data as unknown as TableNodeData).tableId)
    );
    for (const id of Object.keys(tableStore.tables)) {
      if (!tableIds.has(id)) tableStore.removeTable(id);
    }

    const columnIds = new Set(
      nodes.flatMap(n => n.type === 'table' ? (n.data as unknown as TableNodeData).columns.map(c => c.id) : [])
    );
    for (const id of Object.keys(columnStore.columns)) {
      if (!columnIds.has(id)) columnStore.removeColumn(id);
    }

    const noteIds = new Set(
      nodes.filter(n => n.type === 'note').map(n => (n.data as unknown as NoteNodeData).noteId)
    );
    for (const id of Object.keys(noteStore.notes)) {
      if (!noteIds.has(id)) noteStore.removeNote(id);
    }

    const relIds = new Set(
      edges.filter(e => e.type === 'relationship').map(e => (e.data as unknown as RelationshipEdgeData).relationshipId)
    );
    for (const id of Object.keys(relStore.relationships)) {
      if (!relIds.has(id)) relStore.removeRelationship(id);
    }
  }
}
