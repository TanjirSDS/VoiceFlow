-- Learning can propose filler words learned from an agent's calls ("Oh, gotcha.", "Yeah, so.").
-- Applied phrases live in agents.config (call.fillerPhrases), so only the type list changes.
alter table agent_suggestions drop constraint agent_suggestions_type_check;
alter table agent_suggestions add constraint agent_suggestions_type_check
  check (type in ('faq_addition', 'prompt_tweak', 'kb_gap', 'escalation_rule', 'filler_phrases'));
