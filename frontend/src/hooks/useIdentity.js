import { useContext } from 'react';
import { IdentityContext } from '../lib/identity';

export function useIdentity() {
  return useContext(IdentityContext);
}
