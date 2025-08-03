import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { getForumCategories } from '../../../db/utils';

export const getForumCategoriesProcedure = publicProcedure
  .query(async () => {
    const categories = await getForumCategories();
    return categories;
  });