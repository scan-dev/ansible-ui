import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { ButtonVariant } from '@patternfly/react-core';
import { IRemotes } from '../Remotes';
import { RouteObj } from '../../../Routes';
import { useNavigate } from 'react-router-dom';
import { useDeleteRemotes } from './useDeleteRemotes';
import { IPulpView } from '../../usePulpView';

export function useRemoteActions(view: IPulpView<IRemotes>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteRemotes = useDeleteRemotes(view.unselectItemsAndRefresh);
  const actions = useMemo<IPageAction<IRemotes>[]>(
    () => [
      {
        icon: EditIcon,
        isPinned: true,
        label: t('Edit remote 2'),
        onClick: (remotes) =>
          navigate(RouteObj.EditRemotes.replace(':id', remotes.name.toString())),
        selection: PageActionSelection.Single,
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
      },
      {
        type: PageActionType.Seperator,
      },
      {
        icon: TrashIcon,
        label: t('Delete remote'),
        onClick: (remotes) => deleteRemotes([remotes]),
        selection: PageActionSelection.Single,
        type: PageActionType.Button,
        isDanger: true,
      },
    ],
    [t, navigate, deleteRemotes]
  );

  return actions;
}
