//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { ReportEntry } from './ReportEntry.js';
import type { UniversalAppSchema } from '@rayfin-app/shared';

/**
 * The app's Rayfin data schema.
 *
 * Keep the runtime entities and shared browser contract aligned.
 */
export type { UniversalAppSchema };
export { ReportEntry };

export const schema = [ReportEntry];
