import FormBuilder from 'antd-form-builder';
import { Button, Card, Form, Modal, Input } from 'antd';
import { QuestionAnswerID } from '@wormgraph/helpers';
import { QuestionFieldType } from '../../api/graphql/generated/types';
import { Rule } from 'antd/lib/form';
import { useEffect, useState } from 'react';
import Checkbox from 'antd/es/checkbox';
import { $Horizontal, $ColumnGap } from '@/components/generics';

export const QuestionTypes = [
  QuestionFieldType.Text,
  QuestionFieldType.Email,
  QuestionFieldType.Phone,
  QuestionFieldType.Address,
  QuestionFieldType.Screenshot,
  QuestionFieldType.Date,
  QuestionFieldType.Link,
  QuestionFieldType.Number,
  QuestionFieldType.SingleSelect,
  QuestionFieldType.MultiSelect,
];

export type QuestionDef = {
  id: QuestionAnswerID;
  question: string;
  type: QuestionFieldType;
  mandatory?: boolean;
};
export type QuestionsEditorProps = {
  mode: 'create' | 'edit-only' | 'view-edit' | 'view-only';
  questions: QuestionDef[];
  pending?: boolean;
};

const QuestionsEditor: React.FC<QuestionsEditorProps> = ({ mode, pending, questions }) => {
  const [form] = Form.useForm();
  // @ts-ignore
  const forceUpdate = FormBuilder.useForceUpdate();
  const lockedToEdit = mode === 'create' || mode === 'edit-only';
  const [questionsHash, setQuestionsHash] = useState<Record<QuestionAnswerID, QuestionDef>>({});
  useEffect(() => {
    console.log('resettings the questions...');
    if (questions.length === 0) {
      setQuestionsHash({
        ['new-1' as QuestionAnswerID]: {
          id: 'new-1' as QuestionAnswerID,
          question: '',
          type: QuestionFieldType.Text,
          mandatory: false,
        },
      });
    } else {
      setQuestionsHash(
        questions.reduce((acc, q) => {
          return { ...acc, [q.id]: q };
        }, {} as Record<QuestionAnswerID, QuestionDef>),
      );
    }
  }, []);
  const getMeta = (qid: QuestionAnswerID) => {
    if (!questionsHash[qid]) {
      const meta = {
        columns: 1,
        disabled: pending,
        initialValues: questionsHash[qid],
        fields: [],
      };
      return meta;
    }
    console.log(`questionsHash[qid]`, questionsHash[qid]);
    const meta = {
      columns: 4,
      disabled: pending,
      initialValues: questionsHash[qid],
      // @ts-ignore
      formItemLayout: null,
      fields: [
        {
          key: `${qid}.question`,
          label: 'Question',
          initialValue: questionsHash[qid].question,
          colSpan: 2,
          required: true,
          tooltip: 'The question you want users to answer',
          widget: () => (
            <Input
              value={questionsHash[qid].question}
              onChange={(e) => {
                console.log(e);
                setQuestionsHash({
                  ...questionsHash,
                  [qid]: {
                    ...questionsHash[qid],
                    question: e.target.value,
                  },
                });
                e.target.focus();
              }}
            />
          ),
        },
        {
          key: `${qid}.type`,
          label: 'Type',
          initialValue: questionsHash[qid].type,
          colSpan: 1,
          tooltip:
            'Choose text answers for the most flexible. Address refers to a blockchain address. Screenshot is an image upload.',
          widget: 'select',
          options: QuestionTypes,
        },
        {
          key: `${qid}.mandatory`,
          label: 'Mandatory',
          colSpan: 1,
          initialValue: questionsHash[qid].mandatory,
          widget: () => (
            <$Horizontal verticalCenter>
              <Checkbox
                checked={questionsHash[qid].mandatory}
                onClick={() => {
                  setQuestionsHash({
                    ...questionsHash,
                    [qid]: {
                      ...questionsHash[qid],
                      mandatory: !questionsHash[qid].mandatory,
                    },
                  });
                }}
              />
              <$ColumnGap />
              <Button
                type="ghost"
                onClick={() => {
                  const newQuestionsHash = { ...questionsHash };
                  delete newQuestionsHash[qid];
                  setQuestionsHash(newQuestionsHash);
                }}
              >
                Remove
              </Button>
            </$Horizontal>
          ),
          tooltip: 'Whether you want this question to be mandatory, or optional',
        },
      ],
    };
    return meta;
  };
  return (
    <div>
      <$Horizontal justifyContent="flex-end">
        <Button
          type="ghost"
          onClick={() => {
            setQuestionsHash({
              ...questionsHash,
              [`new-${Object.keys(questionsHash).length + 1}`]: {
                id: `new-${Object.keys(questionsHash).length + 1}`,
                question: '',
                type: QuestionFieldType.Text,
              },
            });
          }}
        >
          Add Question
        </Button>
      </$Horizontal>
      <br />
      {Object.keys(questionsHash).map((key) => {
        const q = questionsHash[key];
        return (
          <div key={`question-${q.id}`}>
            <FormBuilder
              form={form}
              // @ts-ignore
              meta={getMeta(q.id)}
              viewMode={mode === 'view-only'}
              // onValuesChange={forceUpdate}
            />
          </div>
        );
      })}
    </div>
  );
};

export default QuestionsEditor;
