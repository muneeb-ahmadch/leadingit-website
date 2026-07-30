import { absoluteUrl } from '@/lib/site';
import type { JsonLdNode } from './types';

export type VideoObjectInput = {
  name: string;
  description: string;
  thumbnailUrl: string[];
  /** ISO 8601. Must be the real upload date — never a build-time timestamp. */
  uploadDate: string;
  contentUrl?: string;
  embedUrl?: string;
  /** ISO 8601 duration (e.g. `'PT1M33S'`) — only if measured from the real file. */
  duration?: string;
};

/**
 * AWAITING CONTENT — no video asset exists in the repo yet. `VideoObject`
 * needs a real `thumbnailUrl`, `uploadDate` and either `contentUrl` or
 * `embedUrl` to be worth emitting at all; never fabricate a `duration` or an
 * `uploadDate` to fill this in ahead of real footage.
 */
export function buildVideoObject(input: VideoObjectInput): JsonLdNode {
  const node: JsonLdNode = {
    '@type': 'VideoObject',
    name: input.name,
    description: input.description,
    thumbnailUrl: input.thumbnailUrl.map((src) => absoluteUrl(src)),
    uploadDate: input.uploadDate,
  };

  if (input.contentUrl) node.contentUrl = absoluteUrl(input.contentUrl);
  if (input.embedUrl) node.embedUrl = absoluteUrl(input.embedUrl);
  if (input.duration) node.duration = input.duration;

  return node;
}
