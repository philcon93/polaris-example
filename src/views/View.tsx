import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { Badge, Heading, DataTable } from '@shopify/polaris';
import constants from "../store/constants";
import { Detail, Sort } from '../store/interfaces';
import { Card, PageLoader, PageTitle } from '../components';
import { average, colourGrade } from "../utilities/format";

export const ViewPage: React.FC = () => {
    const [ details, setDetails ] = useState<Detail>();
    const [ sortDirection, setSortDirection ] = useState<Sort>('none');
    const { id } = useParams<{ id: string}>();

    useEffect(() => {
        if (id) {
            fetch(`${constants.ENDPOINT_URL}/${id}`)
            .then(response => response.json())
            .then(data => setDetails(data.survey_result_detail));
        }
    }, [ id ]);

    return (
        details ?
        <>
            <PageTitle title={details.name} breadcrumb={{ url: '/surveys'}}/>
            { details.themes.map((theme, index) => (
                <Card key={index}>
                    <Heading>{theme.name}</Heading>
                    <DataTable
                        columnContentTypes={[ 'text', 'numeric' ]}
                        headings={[ 'Question', 'Average response' ]}
                        sortable={[ false, true ]}
                        onSort={(headingIndex, direction) => setSortDirection(direction)}
                        rows={theme.questions
                            .sort((questionA, questionB) => {
                                const amountA = average(questionA.survey_responses)
                                const amountB = average(questionB.survey_responses)
                          
                                return sortDirection === 'descending' ? amountB - amountA : amountA - amountB;
                            })
                            .map(question => [
                                question.description,
                                <Badge status={colourGrade(average(question.survey_responses), 5)}>
                                    {average(question.survey_responses).toString()}
                                </Badge>
                            ]
                        )} />
                </Card>
            ))}
        </> : <PageLoader />
    );
};