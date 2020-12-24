import { getCurrentInstance, withScopeId } from 'vue';

export function getScopeIdRender() {
  const { type } = getCurrentInstance();
  return withScopeId(type.__scopeId);
}
