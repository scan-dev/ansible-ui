import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  usePageNavigate,
} from '../../../../../framework';
import { useGetPageUrl } from '../../../../../framework/PageNavigation/useGetPageUrl';
import { dateToInputDateTime } from '../../../../../framework/utils/dateTimeHelpers';
import { AwxRoute } from '../../../main/AwxRoutes';
import { RuleFields, ScheduleFormWizard } from '../types';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { RulesStep } from './RulesStep';
import { RRule, RRuleSet } from 'rrule';
import { ExceptionsStep } from './ExceptionsStep';
import { SurveyStep } from '../../../common/SurveyStep';
import { ScheduleSelectStep } from './ScheduleSelectStep';
import { NodePromptsStep } from '../../../resources/templates/WorkflowVisualizer/wizard/NodePromptsStep';
import { WizardFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { shouldHideOtherStep } from '../../../resources/templates/WorkflowVisualizer/wizard/helpers';
import { RESOURCE_TYPE } from '../../../resources/templates/WorkflowVisualizer/constants';
import { NodeReviewStep } from '../../../resources/templates/WorkflowVisualizer/wizard/NodeReviewStep';
import { useProcessSchedule } from '../hooks/useProcessSchedules';
import { useNavigate } from 'react-router-dom';
import { Schedule } from '../../../interfaces/Schedule';
import { RequestError } from '../../../../common/crud/RequestError';
import { RULES_DEFAULT_VALUES } from './constants';

export type StandardizedFormData = Omit<ScheduleFormWizard, 'rules' | 'exceptions'> & {
  rrule: string;
};
export function ScheduleAddWizard() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const processSchedules = useProcessSchedule();
  const now = DateTime.now();
  const closestQuarterHour: DateTime = DateTime.fromMillis(
    Math.ceil(now.toMillis() / 900000) * 900000
  );

  const [currentDate, time]: string[] = dateToInputDateTime(closestQuarterHour.toISO() as string);
  const handleSubmit = async (formValues: ScheduleFormWizard) => {
    const { rules, exceptions, ...rest } = formValues;

    const ruleset = new RRuleSet();
    rules.forEach((r) => {
      ruleset.rrule(new RRule({ ...r.rule.options }));
    });
    if (exceptions.length) {
      exceptions?.forEach((r) => {
        ruleset.exrule(new RRule({ ...r.rule.options }));
      });
    }
    const data: StandardizedFormData = {
      rrule: ruleset.toString(),
      ...rest,
    };

    const {
      schedule,
      navigationId,
      params,
    }: {
      schedule: Schedule;
      navigationId: string;
      params: { id: string; source_id?: string; inventory_type?: string };
    } = await processSchedules(data);
    pageNavigate(navigationId, { params: { schedule_id: schedule.id, ...params } });
  };

  const onCancel = () => navigate(location.pathname.replace('create', ''));

  const steps: PageWizardStep[] = [
    {
      id: 'details',
      label: t('Details'),
      inputs: <ScheduleSelectStep />,
    },
    {
      id: 'nodePromptsStep',
      label: t('Prompts'),
      inputs: <NodePromptsStep />,
      hidden: (wizardData: Partial<ScheduleFormWizard>) => {
        const { resource, schedule_type, launch_config } = wizardData;
        if (
          (schedule_type === RESOURCE_TYPE.workflow_job || schedule_type === RESOURCE_TYPE.job) &&
          resource &&
          launch_config
        ) {
          return shouldHideOtherStep(launch_config);
        }
        return true;
      },
    },
    {
      id: 'survey',
      label: t('Survey'),
      inputs: <SurveyStep />,
      hidden: (wizardData: Partial<WizardFormValues>) => {
        if (Object.keys(wizardData).length === 0) {
          return true;
        }
        if (wizardData.launch_config?.survey_enabled) {
          return false;
        }
        return true;
      },
    },
    {
      id: 'rules',
      label: t('Rules'),
      inputs: <RulesStep />,
      validate: (formData: Partial<RuleFields>) => {
        if (!formData?.rules?.length) {
          const errors = {
            __all__: [t('Schedules must have at least one rule.')],
          };

          throw new RequestError('', '', 400, '', errors);
        }
      },
    },
    {
      id: 'exceptions',
      label: t('Exceptions'),
      inputs: <ExceptionsStep />,
    },
    { id: 'review', label: t('Review'), inputs: <NodeReviewStep /> },
  ];
  const initialValues = {
    details: {
      name: '',
      description: '',
      schedule_type: '',
      resource: '',
      startDateTime: { date: currentDate, time: time },
      timezone: 'America/New_York',
    },
    rules: { ...RULES_DEFAULT_VALUES, rules: [] },
    exceptions: { ...RULES_DEFAULT_VALUES, exceptions: [] },
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Schedule')}
        breadcrumbs={[
          { label: t('Schedules'), to: getPageUrl(AwxRoute.Schedules) },
          { label: t('Create Schedule') },
        ]}
      />
      <PageWizard<ScheduleFormWizard>
        steps={steps}
        singleColumn={false}
        onCancel={onCancel}
        defaultValue={initialValues}
        onSubmit={handleSubmit}
        errorAdapter={awxErrorAdapter}
      />
    </PageLayout>
  );
}
