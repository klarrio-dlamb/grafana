import { createSelector } from 'reselect';
import { RequestStatus, PluginCatalogStoreState } from '../types';
import { pluginsAdapter } from './reducer';

export const selectRoot = (state: PluginCatalogStoreState) => state.plugins;

export const selectItems = createSelector(selectRoot, ({ items }) => items);

export const { selectAll, selectById } = pluginsAdapter.getSelectors(selectItems);

const selectInstalled = (filterBy: string) =>
  createSelector(selectAll, (plugins) =>
    plugins.filter((plugin) => (filterBy === 'installed' ? plugin.isInstalled : !plugin.isCore))
  );

const findByInstallAndType = (filterBy: string, filterByType: string) =>
  createSelector(selectInstalled(filterBy), (plugins) =>
    plugins.filter((plugin) => filterByType === 'all' || plugin.type === filterByType)
  );

const findByKeyword = (searchBy: string) =>
  createSelector(selectAll, (plugins) => {
    if (searchBy === '') {
      return [];
    }

    return plugins.filter((plugin) => {
      const fields: String[] = [];
      if (plugin.name) {
        fields.push(plugin.name.toLowerCase());
      }

      if (plugin.orgName) {
        fields.push(plugin.orgName.toLowerCase());
      }

      return fields.some((f) => f.includes(searchBy.toLowerCase()));
    });
  });

export const find = (searchBy: string, filterBy: string, filterByType: string) =>
  createSelector(
    findByInstallAndType(filterBy, filterByType),
    findByKeyword(searchBy),
    (filteredPlugins, searchedPlugins) => {
      return searchBy === '' ? filteredPlugins : searchedPlugins;
    }
  );

export const selectRequest = (actionType: string) =>
  createSelector(selectRoot, ({ requests = {} }) => requests[actionType]);

export const selectIsRequestPending = (actionType: string) =>
  createSelector(selectRequest(actionType), (request) => request?.status === RequestStatus.Pending);

export const selectRequestError = (actionType: string) =>
  createSelector(selectRequest(actionType), (request) =>
    request?.status === RequestStatus.Rejected ? request?.error : null
  );

export const selectIsRequestNotFetched = (actionType: string) =>
  createSelector(selectRequest(actionType), (request) => request === undefined);
