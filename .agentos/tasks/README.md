# Task Tracking

This directory contains task tracking files for Agent OS.

## Task Naming Convention

Use kebab-case: `task-name.md`

## Task Status

- **pending**: Not yet started
- **in_progress**: Currently being worked on
- **completed**: Finished and verified
- **blocked**: Cannot proceed due to dependency

## Task Priority

- **P0**: Critical - blocks other work
- **P1**: Important - should be done soon
- **P2**: Nice to have - can wait

## Creating a New Task

1. Copy `task-template.md`
2. Fill in task details
3. Set status to `pending`
4. Link from relevant spec if applicable

## Updating Tasks

- Update status as work progresses
- Add progress log entries
- Update related tasks section
- Mark completed when done

## Task Organization

Tasks can be organized by:
- Feature area (e.g., `card-creation-*.md`)
- Sprint/iteration
- Priority
- Assignee

## Integration with Development

- Reference tasks in commit messages
- Link tasks to PRs
- Update tasks during code review
- Close tasks when merged

