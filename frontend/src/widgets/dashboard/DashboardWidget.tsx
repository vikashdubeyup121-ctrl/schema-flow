import { useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/shared/components/Button';
import { AppHeader } from '@/shared/components/layout/AppHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useProjectStore } from '@/features/project/stores/project.store';
import {
  AddIcon,
  ProjectIcon,
  DiagramIcon,

  ChevronDownIcon,
  ChevronRightIcon,


} from '@/shared/icons';
import {
  ProjectCard,
  CreateProjectModal,
  ManageMembersModal,
  useProjects,
  useProjectMutations,
} from '@/features/project';
import {
  DiagramCard,
  CreateDiagramModal,
  useDiagrams,
  useDiagramMutations,
} from '@/features/diagram';

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

function ProjectSkeleton(): ReactNode {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      <div className="w-10 h-10 rounded-lg bg-surface animate-pulse" />
      <div className="h-4 w-3/4 rounded bg-surface animate-pulse" />
      <div className="h-3 w-1/2 rounded bg-surface animate-pulse" />
    </div>
  );
}

function DiagramSkeleton(): ReactNode {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      <div className="w-9 h-9 rounded-lg bg-surface animate-pulse" />
      <div className="h-4 w-2/3 rounded bg-surface animate-pulse" />
      <div className="h-3 w-1/3 rounded bg-surface animate-pulse" />
    </div>
  );
}

// ─── Diagram section (shown when a project is selected) ────────────────────────

interface DiagramSectionProps {
  projectId: string;
  onNavigate: (diagramId: string) => void;
  onDeleteRequest: (diagramId: string, projectId: string) => void;
}

function DiagramSection({ projectId, onNavigate, onDeleteRequest }: DiagramSectionProps): ReactNode {
  const { diagrams, isLoading, isError } = useDiagrams(projectId);
  const { create, update } = useDiagramMutations();
  const [createOpen, setCreateOpen] = useState(false);

  const handleCreate = useCallback(
    (name: string) => {
      create.mutate(
        { name, projectId },
        { onSuccess: () => setCreateOpen(false) },
      );
    },
    [create, projectId],
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <DiagramSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="mt-4 text-sm text-danger">
        Failed to load diagrams.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
        {diagrams.map((diagram) => (
          <DiagramCard
            key={diagram.id}
            diagram={diagram}
            onOpen={() => onNavigate(diagram.id)}
            onRename={(name) =>
              update.mutate({ id: diagram.id, name, projectId })
            }
            onDelete={() => onDeleteRequest(diagram.id, projectId)}
          />
        ))}

        {/* New diagram card */}
        <button
          onClick={() => setCreateOpen(true)}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all duration-150 p-4 min-h-[100px]"
        >
          <AddIcon size={20} />
          <span className="text-xs font-medium">New Diagram</span>
        </button>
      </div>

      {diagrams.length === 0 && !isLoading && (
        <p className="mt-2 text-sm text-muted-foreground">
          No diagrams yet. Create your first one above.
        </p>
      )}

      <CreateDiagramModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        isLoading={create.isPending}
      />
    </>
  );
}

// ─── Main DashboardWidget ─────────────────────────────────────────────────────

export function DashboardWidget(): ReactNode {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { projects, isLoading, isError, refetch } = useProjects();
  const { create, update, remove } = useProjectMutations();
  const { remove: removeDiagram } = useDiagramMutations();
  const { selectedProjectId, setSelectedProject } = useProjectStore();
  
  const [createOpen, setCreateOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [diagramToDelete, setDiagramToDelete] = useState<{ id: string; projectId: string } | null>(null);
  const [shareProject, setShareProject] = useState<{ id: string; name: string; ownerId: string } | null>(null);

  // Pre-fetch diagram counts — diagrams are loaded lazily per project
  // diagramCount is shown on each project card from the query cache if available

  const handleCreateProject = useCallback(
    (name: string) => {
      create.mutate(name, {
        onSuccess: (project) => {
          setCreateOpen(false);
          setSelectedProject(project.id);
        },
      });
    },
    [create, setSelectedProject],
  );

  const handleSelectProject = useCallback(
    (id: string) => {
      setSelectedProject(selectedProjectId === id ? null : id);
    },
    [selectedProjectId, setSelectedProject],
  );

  const handleNavigateToDiagram = useCallback(
    (diagramId: string) => {
      navigate(`/workspace/${diagramId}`);
    },
    [navigate],
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <AppHeader />

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.name ? `Welcome back, ${user.name.split(' ')[0]}.` : 'Your database schemas.'}
          </p>
        </div>

        {/* Error state */}
        {isError && (
          <ErrorState
            title="Failed to load projects"
            message="There was a problem fetching your projects."
            onRetry={refetch}
          />
        )}

        {/* Loading state */}
        {isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProjectSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && projects.length === 0 && (
          <EmptyState
            icon={<ProjectIcon size={48} />}
            title="No projects yet"
            description="Create your first project to start designing database schemas."
            action={
              <Button
                leftIcon={<AddIcon size={14} />}
                onClick={() => setCreateOpen(true)}
              >
                New Project
              </Button>
            }
          />
        )}

        {/* Project grids */}
        {!isLoading && !isError && projects.length > 0 && (
          <div className="flex flex-col gap-10">
            {/* My Projects */}
            {projects.filter(p => p.ownerId === user?.id).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">My Projects</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {projects.filter(p => p.ownerId === user?.id).map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      diagramCount={project.diagramCount}
                      isSelected={selectedProjectId === project.id}
                      isOwner={true}
                      onSelect={() => handleSelectProject(project.id)}
                      onRename={(name) => update.mutate({ id: project.id, name })}
                      onDelete={() => setProjectToDelete(project.id)}
                      onShare={() => setShareProject({ id: project.id, name: project.name, ownerId: project.ownerId })}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Shared with me */}
            {projects.filter(p => p.ownerId !== user?.id).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Shared with me</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {projects.filter(p => p.ownerId !== user?.id).map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      diagramCount={project.diagramCount}
                      isSelected={selectedProjectId === project.id}
                      isOwner={false}
                      onSelect={() => handleSelectProject(project.id)}
                      onRename={(name) => update.mutate({ id: project.id, name })}
                      onDelete={() => setProjectToDelete(project.id)}
                      onShare={() => setShareProject({ id: project.id, name: project.name, ownerId: project.ownerId })}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Expanded project — diagram section */}
            {selectedProjectId && (
              <section className="border border-border rounded-xl overflow-hidden mt-4">
                <div className="flex items-center justify-between px-5 py-3 bg-surface border-b border-border">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    {selectedProjectId ? (
                      <ChevronDownIcon size={16} className="text-muted-foreground" />
                    ) : (
                      <ChevronRightIcon size={16} className="text-muted-foreground" />
                    )}
                    <DiagramIcon size={16} className="text-muted-foreground" />
                    {projects.find((p) => p.id === selectedProjectId)?.name}
                  </div>
                </div>
                <div className="p-5">
                  <DiagramSection
                    projectId={selectedProjectId}
                    onNavigate={handleNavigateToDiagram}
                    onDeleteRequest={(id, projectId) => setDiagramToDelete({ id, projectId })}
                  />
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Create project modal */}
      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateProject}
        isLoading={create.isPending}
      />

      {/* Share project modal */}
      {shareProject && (
        <ManageMembersModal
          isOpen={true}
          onClose={() => setShareProject(null)}
          projectId={shareProject.id}
          projectName={shareProject.name}
          isOwner={shareProject.ownerId === user?.id}
        />
      )}

      {/* Delete Confirmation Modals */}
      <ConfirmDialog
        open={projectToDelete !== null}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (projectToDelete) {
            remove.mutate(projectToDelete);
            setProjectToDelete(null);
            if (selectedProjectId === projectToDelete) {
              setSelectedProject(null);
            }
          }
        }}
        onCancel={() => setProjectToDelete(null)}
      />

      <ConfirmDialog
        open={diagramToDelete !== null}
        title="Delete Diagram"
        description="Are you sure you want to delete this diagram? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (diagramToDelete) {
            removeDiagram.mutate(diagramToDelete);
            setDiagramToDelete(null);
          }
        }}
        onCancel={() => setDiagramToDelete(null)}
      />
    </div>
  );
}

// Inline SVG logo to avoid icon dependency

