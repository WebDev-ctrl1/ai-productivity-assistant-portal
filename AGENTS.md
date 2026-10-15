<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- All AI calls go through `src/lib/ai-service.ts` -> `/api/ai` server route (prompts + key server-side); keeps secrets out of the browser.
- History/activity live in browser localStorage under `wpa.*` keys; brief forbids a database.
