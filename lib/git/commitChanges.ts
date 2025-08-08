import { Octokit } from "@octokit/rest"

interface CommitChangesOptions {
  owner: string
  repo: string
  token: string
  authorName: string
  authorEmail: string
  changes: Array<{ filePath: string; content: string }>
}

export async function commitChanges({
  owner,
  repo,
  token,
  authorName,
  authorEmail,
  changes,
}: CommitChangesOptions): Promise<string> {
  const octokit = new Octokit({ auth: token })
  const branchName = `editor-changes-${Date.now()}`
  const commitMessage = "Editor changes from editor.harnosandshf.se"
  const prTitle = "Editor changes from editor.harnosandshf.se"

  try {
    // 1. Get the default branch (e.g., 'main' or 'master')
    const { data: repoData } = await octokit.repos.get({ owner, repo })
    const defaultBranch = repoData.default_branch

    // 2. Get the SHA of the latest commit on the default branch
    const { data: { object: { sha: latestCommitSha } } } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    })

    // 3. Create a new branch from the latest commit
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: latestCommitSha,
    })

    // 4. Create or update files
    const tree = changes.map((change) => ({
      path: change.filePath,
      mode: "100644" as const, // file mode
      type: "blob" as const, // blob type
      content: change.content,
    }))

    const { data: { sha: treeSha } } = await octokit.git.createTree({
      owner,
      repo,
      tree,
      base_tree: latestCommitSha, // Base the new tree on the latest commit's tree
    })

    // 5. Create a new commit
    const { data: { sha: newCommitSha } } = await octokit.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: treeSha,
      parents: [latestCommitSha],
      author: {
        name: authorName,
        email: authorEmail,
        date: new Date().toISOString(),
      },
    })

    // 6. Update the new branch to point to the new commit
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branchName}`,
      sha: newCommitSha,
    })

    // 7. Create a Pull Request
    const { data: pr } = await octokit.pulls.create({
      owner,
      repo,
      title: prTitle,
      head: branchName,
      base: defaultBranch,
      body: "Automated content changes from the editor.",
    })

    return pr.html_url
  } catch (error) {
    console.error("Error committing changes and creating PR:", error)
    throw new Error(`Failed to commit changes and create PR: ${error instanceof Error ? error.message : String(error)}`)
  }
}
