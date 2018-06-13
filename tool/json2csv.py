#!/usr/bin/env python
import os
import sys
import json
import csv
import codecs
from optparse import OptionParser

def create_csv_head():
    '''
    Create the csv file head and make it easy to extend.
    :param:
    :return csv_head:
    '''
    head = []

    # the columns that are determined at present
    head.append('Feature')
    head.append('Case Id')
    head.append('Test Case')
    head.append('Pass')
    head.append('Fail')
    head.append('N/A')

    # If you want to extend other column, add here.
    head.append('Measured')
    head.append('Comment')
    head.append('Measurement Name')
    head.append('Value')
    head.append('Unit')
    head.append('Target')
    head.append('Failure')
    head.append('Execution')
    head.append('Suite Name')

    return head

def get_test_name(test_path):
    p,f = os.path.split(test_path); 
    return f[:-3]

def json2csv(json_file):
    '''
    Conver result json created by jest to csv format.
    :param json_file:
    :return csv_data:
    '''
    json_data = None
    csv_data = []
    all_results = None

    csv_head = create_csv_head()
    head_len = len(csv_head)
    csv_data.append(csv_head)

    with open(json_file) as f:
        json_data = json.load(f, encoding = 'utf8')

    if json_data:
        all_results = json_data.get('testResults')

    if len(all_results) < 0:
        print 'Invaild result json!\n'
        return -1
    
    for result in all_results:
        test_file = result.get('testFilePath')
        test_name = get_test_name(test_file)
        test_results = result.get('testResults')
        for index in range(len(test_results)):
            test_result = test_results[index]
            feature = test_result.get('ancestorTitles')
            title = test_result.get('title')
            status = test_result.get('status')

            csv_row = ['' for i in xrange(head_len)]
            csv_row[0] = feature[0]
            csv_row[1] = '%s-%02d' % (test_name, index)
            csv_row[2] = title

            if status == 'passed':
                csv_row[3] = '1'
            elif status == 'failed':
                csv_row[4] = '1'
            else:
                csv_row[5] = '1'

            csv_row[head_len - 2] = 'auto'
            csv_row[head_len - 1] = 'test'

            csv_data.append(csv_row)

    return (csv_data)

def write_csv_file(csv_data, csv_file):
    '''
    Write csv_data to the csv file
    '''
    # Append result to csv, remove head row
    if os.path.exists(csv_file):
        del csv_data[0]

    with open(csv_file, 'a') as csvfobj:
        csvfobj.write(codecs.BOM_UTF8)
        csv_writer = csv.writer(csvfobj, delimiter = ',')
        for row in csv_data:
             #print row
             csv_writer.writerow([val.encode('utf8') for val in row])

def main():
    usage = 'Usage: ./json2csv.py -i test-results.json [-o test-results.csv] '
    opt_parser = OptionParser(usage = usage)
    opt_parser.add_option('-i', '--input', dest = 'jsonfile',
                          help = 'Input test results json path')
    opt_parser.add_option('-o', '--output', dest = 'csvfile',
                          help = 'The output csv path parsed from input json (optional)')

    if len(sys.argv) == 1:
        sys.argv.append('-h')

    (options, args) = opt_parser.parse_args()

    if options.jsonfile:
        (csv_data) = json2csv(options.jsonfile)
        if options.csvfile:
            write_csv_file(csv_data, options.csvfile)
        else:
            write_csv_file(csv_data, options.jsonfile.replace('json', 'csv'))
    else:
        sys.stderr.write('Input json file must be specified!\n')
        sys.exit(1)


if __name__ == '__main__':
    main()
    print 'Done!'