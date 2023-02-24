import { MenuItem } from "./entities/menu-item.entity";
import { Repository } from "typeorm";
import App from "../../app";

export class MenuItemsService {
  private menuItemRepository: Repository<MenuItem>;

  constructor(app: App) {
    this.menuItemRepository = app.getDataSource().getRepository(MenuItem);
  }

  /* TODO: complete getMenuItems so that it returns a nested menu structure
    Requirements:
    - your code should result in EXACTLY one SQL query no matter the nesting level or the amount of menu items.
    - it should work for infinite level of depth (children of childrens children of childrens children, ...)
    - verify your solution with `npm run test`
    - do a `git commit && git push` after you are done or when the time limit is over
    - post process your results in javascript
    Hints:
    - open the `src/menu-items/menu-items.service.ts` file
    - partial or not working answers also get graded so make sure you commit what you have
    Sample response on GET /menu:
    ```json
    [
        {
            "id": 1,
            "name": "All events",
            "url": "/events",
            "parentId": null,
            "createdAt": "2021-04-27T15:35:15.000000Z",
            "children": [
                {
                    "id": 2,
                    "name": "Laracon",
                    "url": "/events/laracon",
                    "parentId": 1,
                    "createdAt": "2021-04-27T15:35:15.000000Z",
                    "children": [
                        {
                            "id": 3,
                            "name": "Illuminate your knowledge of the laravel code base",
                            "url": "/events/laracon/workshops/illuminate",
                            "parentId": 2,
                            "createdAt": "2021-04-27T15:35:15.000000Z",
                            "children": []
                        },
                        {
                            "id": 4,
                            "name": "The new Eloquent - load more with less",
                            "url": "/events/laracon/workshops/eloquent",
                            "parentId": 2,
                            "createdAt": "2021-04-27T15:35:15.000000Z",
                            "children": []
                        }
                    ]
                },
                {
                    "id": 5,
                    "name": "Reactcon",
                    "url": "/events/reactcon",
                    "parentId": 1,
                    "createdAt": "2021-04-27T15:35:15.000000Z",
                    "children": [
                        {
                            "id": 6,
                            "name": "#NoClass pure functional programming",
                            "url": "/events/reactcon/workshops/noclass",
                            "parentId": 5,
                            "createdAt": "2021-04-27T15:35:15.000000Z",
                            "children": []
                        },
                        {
                            "id": 7,
                            "name": "Navigating the function jungle",
                            "url": "/events/reactcon/workshops/jungle",
                            "parentId": 5,
                            "createdAt": "2021-04-27T15:35:15.000000Z",
                            "children": []
                        }
                    ]
                }
            ]
        }
    ]
  */

  async getMenuItems() {
    try {
      const menuItems: [MenuItem] = await this.menuItemRepository.query(`
      WITH RECURSIVE menu_tree AS (
        SELECT id, name, url, parent_id, created_at, CAST(NULL AS INTEGER[]) AS path
        FROM menu_item
        WHERE parent_id IS NULL
        UNION ALL
        SELECT m.id, m.name, m.url, m.parent_id, m.created_at, path || m.id
        FROM menu_item m
        JOIN menu_tree t ON m.parent_id = t.id
        WHERE NOT m.id = ANY(path)
      )
      SELECT id, name, url, parent_id, created_at
      FROM menu_tree
      ORDER BY path
    `);

      const rootMenuItems = menuItems.filter((mi) => mi.parentId === null);
      const nestedMenuItems = rootMenuItems.map((mi) => {
        const children = menuItems.filter((c) => c.parentId === mi.id);
        return { ...mi, children };
      });

      return nestedMenuItems;
    } catch (error) {
      throw new Error("TODO in task 3", error.message);
    }
  }
}
